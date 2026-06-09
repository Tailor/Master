/**
 * Filesystem location helpers — where the CLI lives, where templates live, and
 * how to detect / locate a scaffolded Master project from the current directory.
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Absolute path to the packaged `templates/` directory.
 *
 * At runtime the built CLI lives in `dist/`, with `templates/` a sibling at the
 * package root, so we walk up from this module until we find it. This keeps the
 * resolution correct whether running from source (tsx), the built bundle, or a
 * globally installed copy.
 */
export function templatesDir(): string {
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, 'templates');
    if (existsSync(join(candidate, 'app'))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: package root is one level up from dist/.
  return resolve(__dirname, '..', 'templates');
}

/** Path to the scaffolded app template that `master new` copies. */
export function appTemplateDir(): string {
  return join(templatesDir(), 'app');
}

/** A Master project is identified by a `master.config.js` at its root. */
export function isProjectRoot(dir: string): boolean {
  return existsSync(join(dir, 'master.config.js'));
}

/**
 * Walk upward from `start` to find the project root (the directory containing
 * `master.config.js`). Returns null if none is found.
 */
export function findProjectRoot(start: string = process.cwd()): string | null {
  let dir = resolve(start);
  for (;;) {
    if (isProjectRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** The backend (MasterController + MasterRecord) directory inside a project. */
export function backendDir(projectRoot: string): string {
  return join(projectRoot, 'backend');
}

/** The Next.js frontend directory inside a project. */
export function frontendDir(projectRoot: string): string {
  return join(projectRoot, 'frontend');
}
