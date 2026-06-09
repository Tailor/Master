/**
 * `master db <action> [name]` — a friendly wrapper over the `masterrecord` CLI,
 * always run inside the backend with the right context + environment.
 *
 *   migrate            -> masterrecord update-database AppContext
 *   rollback           -> masterrecord update-database-down AppContext
 *   new <Name>         -> masterrecord add-migration <Name> AppContext
 *   enable             -> masterrecord enable-migrations AppContext
 *   list               -> masterrecord get-migrations AppContext
 *   ensure             -> masterrecord ensure-database AppContext
 */
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
};

export const DB_ACTIONS = Object.keys(ACTIONS);

export async function runDb(
  action: string,
  name: string | undefined,
  options: { env?: string } = {},
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

  const code = await runOnce('npx', ['masterrecord', ...spec.args(name)], backendDir(root), {
    NODE_ENV: env,
  });
  process.exitCode = code;
}
