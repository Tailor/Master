/**
 * `master db <action> [name]` — a friendly wrapper over the `masterrecord` CLI,
 * always run inside the backend with the right context + environment
 * (the `dotnet ef` equivalent):
 *
 *   migrate            -> masterrecord update-database AppContext
 *   rollback           -> masterrecord update-database-down AppContext
 *   new <Name>         -> masterrecord add-migration <Name> AppContext
 *   remove [--force]   -> masterrecord remove-migration AppContext   (EF: migrations remove)
 *   status             -> masterrecord migrations-status AppContext  (EF: migrations list)
 *   script [-o file]   -> masterrecord script AppContext             (EF: migrations script)
 *   enable             -> masterrecord enable-migrations AppContext
 *   list               -> masterrecord get-migrations AppContext
 *   ensure             -> masterrecord ensure-database AppContext
 */
import { existsSync, readdirSync } from 'node:fs';
import { findProjectRoot, backendDir } from '../lib/paths.js';
import { runOnce } from '../lib/runProcess.js';
import { log } from '../lib/log.js';

const CONTEXT = 'AppContext';

const ACTIONS: Record<string, { args: (name?: string) => string[]; needsName?: boolean }> = {
  migrate: { args: () => ['update-database', CONTEXT] },
  rollback: { args: () => ['update-database-down', CONTEXT] },
  enable: { args: () => ['enable-migrations', CONTEXT] },
  list: { args: () => ['get-migrations', CONTEXT] },
  ensure: { args: () => ['ensure-database', CONTEXT] },
  new: { args: (name) => ['add-migration', name as string, CONTEXT], needsName: true },
  remove: { args: () => ['remove-migration', CONTEXT] },
  status: { args: () => ['migrations-status', CONTEXT] },
  script: { args: () => ['script', CONTEXT] },
};

export const DB_ACTIONS = Object.keys(ACTIONS);

/** True when a `<context>_contextSnapShot.json` exists anywhere under the backend (excluding node_modules). */
export function hasSnapshot(dir: string): boolean {
  if (!existsSync(dir)) return false;
  const entries = readdirSync(dir, { recursive: true, encoding: 'utf8' }) as string[];
  return entries.some((p) => !p.includes('node_modules') && /_contextsnapshot\.json$/i.test(p));
}

export async function runDb(
  action: string,
  name: string | undefined,
  options: { env?: string; force?: boolean; output?: string } = {},
): Promise<void> {
  const root = findProjectRoot();
  if (!root) {
    log.error('Not inside a Master project (no master.config.js found).');
    process.exitCode = 1;
    return;
  }

  const spec = ACTIONS[action];
  if (!spec) {
    log.error(`Unknown db action '${action}'. Available: ${DB_ACTIONS.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  if (spec.needsName && !name) {
    log.error(`'master db ${action}' requires a name:  master db ${action} <MigrationName>`);
    process.exitCode = 1;
    return;
  }

  const env = options.env ?? process.env.NODE_ENV ?? 'development';
  log.step(`db ${action}  ${name ?? ''}`.trim() + `  (env: ${env})`);

  // EF's `add-migration` needs no separate "enable" step: create the context
  // snapshot on first use so `master db new` / `migrate` just work on a fresh app.
  if (action !== 'enable' && !hasSnapshot(backendDir(root))) {
    log.dim('  No context snapshot yet — running enable-migrations first.');
    const enableCode = await runOnce('npx', ['masterrecord', 'enable-migrations', CONTEXT], backendDir(root), { NODE_ENV: env });
    if (enableCode !== 0) {
      process.exitCode = enableCode;
      return;
    }
  }

  const extra: string[] = [];
  if (action === 'remove' && options.force) extra.push('--force');
  if (action === 'script' && options.output) extra.push('-o', options.output);

  const code = await runOnce('npx', ['masterrecord', ...spec.args(name), ...extra], backendDir(root), {
    NODE_ENV: env,
  });
  process.exitCode = code;
}
