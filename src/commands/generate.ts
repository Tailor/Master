/**
 * `master generate <type> <name> [extra...]`
 *
 * Resolves the project root, runs the matching pure generator, writes the new
 * files, and applies route/model registrations to the existing project files.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { findProjectRoot } from '../lib/paths.js';
import { applyEdit, readFileMaybe, writeFiles } from '../lib/files.js';
import { appendRoutes, registerModel } from '../generators/registration.js';
import { buildController } from '../generators/controller.js';
import { buildModel } from '../generators/model.js';
import { buildScaffold } from '../generators/scaffold.js';
import { buildSocket } from '../generators/socket.js';
import { buildMiddleware } from '../generators/middleware.js';
import { buildComponent } from '../generators/component.js';
import { buildPage } from '../generators/page.js';
import type { GeneratorResult } from '../generators/types.js';
import { log } from '../lib/log.js';

const ROUTES_FILE = 'backend/app/routes.js';
const CONTEXT_FILE = 'backend/app/models/AppContext.js';

export const GENERATOR_TYPES = [
  'controller',
  'model',
  'scaffold',
  'socket',
  'middleware',
  'component',
  'page',
] as const;

export type GeneratorType = (typeof GENERATOR_TYPES)[number];

/** Count existing numbered middleware files to compute the next prefix. */
function nextMiddlewareIndex(root: string): number {
  const dir = join(root, 'backend', 'middleware');
  if (!existsSync(dir)) return 1;
  const numbered = readdirSync(dir).filter((f) => /^\d+-.*\.js$/.test(f));
  return numbered.length + 1;
}

/** Resolve a generator type + args into a GeneratorResult. */
export function dispatch(
  type: string,
  name: string,
  extra: string[],
  ctx: { middlewareIndex: number },
): GeneratorResult {
  switch (type) {
    case 'controller':
      return buildController(name, extra);
    case 'model':
      return buildModel(name, extra);
    case 'scaffold':
      return buildScaffold(name, extra);
    case 'socket':
      return buildSocket(name, extra);
    case 'middleware':
      return buildMiddleware(name, ctx.middlewareIndex);
    case 'component':
      return buildComponent(name);
    case 'page':
      return buildPage(name);
    default:
      throw new Error(`Unknown generator '${type}'. Available: ${GENERATOR_TYPES.join(', ')}`);
  }
}

/** Apply a generator result to disk: write files, register routes + models. */
export async function applyResult(root: string, result: GeneratorResult): Promise<void> {
  await writeFiles(root, result.files);

  if (result.routes && result.routes.length > 0) {
    const source = await readFileMaybe(root, ROUTES_FILE);
    if (source !== null) {
      await applyEdit(root, { path: ROUTES_FILE, contents: appendRoutes(source, result.routes) });
    } else {
      log.warn(`Could not find ${ROUTES_FILE} to register routes; add them manually.`);
    }
  }

  if (result.models && result.models.length > 0) {
    const source = await readFileMaybe(root, CONTEXT_FILE);
    if (source !== null) {
      let updated = source;
      for (const model of result.models) updated = registerModel(updated, model);
      await applyEdit(root, { path: CONTEXT_FILE, contents: updated });
    } else {
      log.warn(`Could not find ${CONTEXT_FILE} to register model; add the dbset manually.`);
    }
  }

  for (const note of result.notes ?? []) log.dim('  ' + note);
}

/** CLI entry: `master generate <type> <name> [extra...]`. */
export async function runGenerate(type: string, name: string, extra: string[]): Promise<void> {
  const root = findProjectRoot();
  if (!root) {
    log.error(
      'Not inside a Master project (no master.config.js found). Run `master new <app>` first.',
    );
    process.exitCode = 1;
    return;
  }
  if (!name) {
    log.error(`Please provide a name:  master generate ${type} <name>`);
    process.exitCode = 1;
    return;
  }

  log.step(`Generating ${type}: ${name}`);
  try {
    const result = dispatch(type, name, extra, { middlewareIndex: nextMiddlewareIndex(root) });
    await applyResult(root, result);
    log.success(`Done.`);
  } catch (err) {
    log.error((err as Error).message);
    process.exitCode = 1;
  }
}
