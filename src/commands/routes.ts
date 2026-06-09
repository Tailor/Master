/**
 * `master routes` — print the routes registered in `backend/app/routes.js`.
 *
 * A lightweight static reader (regex over the source) so it works without booting
 * the server or a database.
 */
import pc from 'picocolors';
import { findProjectRoot } from '../lib/paths.js';
import { readFileMaybe } from '../lib/files.js';
import { log } from '../lib/log.js';

export interface RouteRow {
  method: string;
  path: string;
  to: string;
}

const REST_VERBS: Array<[string, string, string]> = [
  ['GET', '/{r}', '{r}#index'],
  ['GET', '/{r}/:id', '{r}#show'],
  ['POST', '/{r}', '{r}#create'],
  ['PUT', '/{r}/:id', '{r}#update'],
  ['DELETE', '/{r}/:id', '{r}#destroy'],
];

/** Parse routes (single routes + `resources(...)`) out of a routes.js source. */
export function parseRoutes(source: string): RouteRow[] {
  const rows: RouteRow[] = [];

  const routeRe =
    /router\.route\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
  for (const m of source.matchAll(routeRe)) {
    rows.push({ method: (m[3] ?? 'get').toUpperCase(), path: m[1] ?? '', to: m[2] ?? '' });
  }

  const resourceRe = /router\.resources\(\s*['"]([^'"]+)['"]/g;
  for (const m of source.matchAll(resourceRe)) {
    const r = m[1] ?? '';
    for (const [method, path, to] of REST_VERBS) {
      rows.push({ method, path: path.replace('{r}', r), to: to.replace('{r}', r) });
    }
  }

  return rows;
}

export async function runRoutes(): Promise<void> {
  const root = findProjectRoot();
  if (!root) {
    log.error('Not inside a Master project (no master.config.js found).');
    process.exitCode = 1;
    return;
  }

  const source = await readFileMaybe(root, 'backend/app/routes.js');
  if (source === null) {
    log.error('No backend/app/routes.js found.');
    process.exitCode = 1;
    return;
  }

  const rows = parseRoutes(source);
  if (rows.length === 0) {
    log.warn('No routes registered yet. Try `master generate scaffold <name>`.');
    return;
  }

  const methodW = Math.max(...rows.map((r) => r.method.length), 6);
  const pathW = Math.max(...rows.map((r) => r.path.length), 4);
  log.info('');
  log.info(
    `  ${pc.bold('METHOD'.padEnd(methodW))}  ${pc.bold('PATH'.padEnd(pathW))}  ${pc.bold('CONTROLLER#ACTION')}`,
  );
  for (const r of rows) {
    log.info(`  ${pc.green(r.method.padEnd(methodW))}  ${r.path.padEnd(pathW)}  ${pc.dim(r.to)}`);
  }
  log.info('');
}
