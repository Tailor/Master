/**
 * `master secrets <set|get|list|remove|clear|path>` — development secrets kept
 * OUTSIDE the repository, the `dotnet user-secrets` equivalent.
 *
 * File: ~/.master/usersecrets/<id>/secrets.json  (override the base dir with
 * MASTER_USER_SECRETS_PATH). The id is the backend package name, which the
 * scaffolded server.js sets as `master.userSecretsId`, so MasterController's
 * configuration layer reads these values automatically in development
 * (`master.configuration.get('Auth:JwtSecret')`). Keys use ':' sections, the same
 * keys you would set as `Auth__JwtSecret` env vars in production.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { findProjectRoot, backendDir } from '../lib/paths.js';
import { log } from '../lib/log.js';

export const SECRETS_ACTIONS = ['set', 'get', 'list', 'remove', 'clear', 'path'] as const;

/** Resolve the secrets id for a project: backend/package.json name, else root package name, else folder name. */
export function secretsIdFor(root: string): string {
  for (const file of [join(backendDir(root), 'package.json'), join(root, 'package.json')]) {
    if (!existsSync(file)) continue;
    try {
      const name = JSON.parse(readFileSync(file, 'utf8')).name;
      if (name && typeof name === 'string') return name;
    } catch {
      /* ignore */
    }
  }
  return root.split(/[\\/]/).filter(Boolean).pop() ?? 'master-app';
}

export function secretsFilePath(id: string): string {
  const base = process.env.MASTER_USER_SECRETS_PATH || join(homedir(), '.master', 'usersecrets');
  return join(base, id.replace(/[^A-Za-z0-9._-]/g, '_'), 'secrets.json');
}

export function readSecrets(file: string): Record<string, unknown> {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch {
    throw new Error(`Secrets file is not valid JSON: ${file}`);
  }
}

function writeSecrets(file: string, data: Record<string, unknown>): void {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}

/** Set a 'Section:Key' path (case-insensitive on existing levels, like the configuration reader). */
export function setSecret(data: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  const parts = key.split(':').filter(Boolean);
  if (!parts.length) throw new Error('A key is required (e.g. Auth:JwtSecret)');
  let cur: Record<string, unknown> = data;
  parts.forEach((raw, i) => {
    const existing = Object.keys(cur).find((k) => k.toLowerCase() === raw.toLowerCase()) ?? raw;
    if (i === parts.length - 1) {
      cur[existing] = value;
      return;
    }
    if (typeof cur[existing] !== 'object' || cur[existing] === null || Array.isArray(cur[existing])) cur[existing] = {};
    cur = cur[existing] as Record<string, unknown>;
  });
  return data;
}

export function getSecret(data: Record<string, unknown>, key: string): unknown {
  let cur: unknown = data;
  for (const raw of key.split(':').filter(Boolean)) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    const obj = cur as Record<string, unknown>;
    const existing = Object.keys(obj).find((k) => k.toLowerCase() === raw.toLowerCase());
    if (existing === undefined) return undefined;
    cur = obj[existing];
  }
  return cur;
}

export function removeSecret(data: Record<string, unknown>, key: string): boolean {
  const parts = key.split(':').filter(Boolean);
  let cur: Record<string, unknown> = data;
  for (let i = 0; i < parts.length; i++) {
    const existing = Object.keys(cur).find((k) => k.toLowerCase() === parts[i]!.toLowerCase());
    if (existing === undefined) return false;
    if (i === parts.length - 1) {
      delete cur[existing];
      return true;
    }
    const next = cur[existing];
    if (typeof next !== 'object' || next === null) return false;
    cur = next as Record<string, unknown>;
  }
  return false;
}

/** Flatten to 'A:B' = value lines (values masked unless reveal). */
export function flattenSecrets(data: Record<string, unknown>, prefix = ''): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  for (const [k, v] of Object.entries(data)) {
    const key = prefix ? `${prefix}:${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) out.push(...flattenSecrets(v as Record<string, unknown>, key));
    else out.push([key, v]);
  }
  return out;
}

const mask = (v: unknown): string => {
  const s = String(v);
  return s.length <= 4 ? '****' : `${s.slice(0, 2)}${'*'.repeat(Math.min(8, s.length - 4))}${s.slice(-2)}`;
};

export async function runSecrets(action: string, key: string | undefined, value: string | undefined, options: { reveal?: boolean; id?: string } = {}): Promise<void> {
  const root = findProjectRoot();
  if (!root) {
    log.error('Not inside a Master project (no master.config.js found).');
    process.exitCode = 1;
    return;
  }
  const id = options.id ?? secretsIdFor(root);
  const file = secretsFilePath(id);
  try {
    switch (action) {
      case 'path':
        log.info(file);
        return;
      case 'list': {
        const rows = flattenSecrets(readSecrets(file));
        if (!rows.length) {
          log.dim(`No secrets for '${id}' (${file}).`);
          return;
        }
        for (const [k, v] of rows) log.info(`${k} = ${options.reveal ? String(v) : mask(v)}`);
        return;
      }
      case 'get': {
        if (!key) throw new Error('Usage: master secrets get <Section:Key>');
        const v = getSecret(readSecrets(file), key);
        if (v === undefined) {
          log.warn(`'${key}' is not set.`);
          process.exitCode = 1;
          return;
        }
        process.stdout.write(String(v) + '\n');
        return;
      }
      case 'set': {
        if (!key || value === undefined) throw new Error('Usage: master secrets set <Section:Key> <value>');
        const data = readSecrets(file);
        setSecret(data, key, value);
        writeSecrets(file, data);
        log.success(`Saved '${key}' for '${id}' (${file})`);
        return;
      }
      case 'remove': {
        if (!key) throw new Error('Usage: master secrets remove <Section:Key>');
        const data = readSecrets(file);
        const removed = removeSecret(data, key);
        writeSecrets(file, data);
        if (removed) log.success(`Removed '${key}'`);
        else log.warn(`'${key}' was not set.`);
        return;
      }
      case 'clear':
        if (existsSync(file)) rmSync(file);
        log.success(`Cleared secrets for '${id}'`);
        return;
      default:
        log.error(`Unknown secrets action '${action}'. Available: ${SECRETS_ACTIONS.join(', ')}`);
        process.exitCode = 1;
    }
  } catch (err) {
    log.error((err as Error).message);
    process.exitCode = 1;
  }
}
