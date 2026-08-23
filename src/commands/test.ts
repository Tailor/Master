/**
 * `master test [--frontend]` — run the backend test suite (node --test through the
 * backend's `npm test`), optionally the frontend's too. The `dotnet test` equivalent.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findProjectRoot, backendDir, frontendDir } from '../lib/paths.js';
import { runOnce } from '../lib/runProcess.js';
import { log } from '../lib/log.js';

function hasTestScript(dir: string): boolean {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return false;
  try {
    const pkg = JSON.parse(readFileSync(file, 'utf8')) as { scripts?: Record<string, string> };
    return typeof pkg.scripts?.test === 'string' && pkg.scripts.test.length > 0;
  } catch {
    return false;
  }
}

export async function runTest(options: { frontend?: boolean; env?: string } = {}): Promise<void> {
  const root = findProjectRoot();
  if (!root) {
    log.error('Not inside a Master project (no master.config.js found).');
    process.exitCode = 1;
    return;
  }
  const env = options.env ?? 'test';
  let code = 0;
  const be = backendDir(root);
  if (hasTestScript(be)) {
    log.step(`test backend  (NODE_ENV=${env})`);
    code = await runOnce('npm', ['test'], be, { NODE_ENV: env });
  } else {
    log.warn('backend/package.json has no "test" script — skipping backend tests.');
  }
  if (options.frontend) {
    const fe = frontendDir(root);
    if (hasTestScript(fe)) {
      log.step('test frontend');
      const feCode = await runOnce('npm', ['test'], fe, { NODE_ENV: env });
      code = code || feCode;
    } else {
      log.warn('frontend/package.json has no "test" script — skipping frontend tests.');
    }
  }
  process.exitCode = code;
}
