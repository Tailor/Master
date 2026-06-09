/**
 * The IO boundary. Generators are pure and return `GeneratedFile` descriptors;
 * everything that actually touches disk goes through here so the pure logic stays
 * testable and the side effects stay in one auditable place.
 */
import fse from 'fs-extra';
import { dirname, relative, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { log } from './log.js';

export interface GeneratedFile {
  /** Path relative to the project root (e.g. `backend/app/controllers/api/usersController.js`). */
  path: string;
  /** Full file contents. */
  contents: string;
}

export interface FileEdit {
  /** Path relative to the project root of an existing file to rewrite. */
  path: string;
  /** New full contents. */
  contents: string;
}

/**
 * Write a set of generated files under `root`. Refuses to clobber an existing
 * file unless `force` is set (prevents a generator from silently destroying work).
 * Returns the list of relative paths actually written.
 */
export async function writeFiles(
  root: string,
  files: GeneratedFile[],
  options: { force?: boolean } = {},
): Promise<string[]> {
  const written: string[] = [];
  for (const file of files) {
    const target = resolve(root, file.path);
    if (existsSync(target) && !options.force) {
      log.warn(`skip (exists)  ${file.path}`);
      continue;
    }
    await fse.ensureDir(dirname(target));
    await fse.writeFile(target, file.contents, 'utf8');
    log.created(file.path);
    written.push(file.path);
  }
  return written;
}

/** Apply an in-place edit to an existing file, logging it as an update. */
export async function applyEdit(root: string, edit: FileEdit): Promise<void> {
  const target = resolve(root, edit.path);
  await fse.ensureDir(dirname(target));
  await fse.writeFile(target, edit.contents, 'utf8');
  log.updated(edit.path);
}

/** Read a project file as a string, or return null if it does not exist. */
export async function readFileMaybe(root: string, relPath: string): Promise<string | null> {
  const target = resolve(root, relPath);
  if (!existsSync(target)) return null;
  return fse.readFile(target, 'utf8');
}

/** Pretty relative path for display. */
export function toRel(root: string, abs: string): string {
  return relative(root, abs) || '.';
}
