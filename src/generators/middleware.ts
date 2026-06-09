/**
 * Middleware generator.
 *
 * Emits an auto-discovered middleware file. The scaffolded backend's server.js
 * loads `backend/middleware/*.js` alphabetically, so a numeric prefix controls
 * ordering. Exports `async (ctx, next) => {}`.
 */
import { kebabCase, upperFirst } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

/**
 * Build a middleware file. `index` is the next ordering number (the command layer
 * computes it from existing files); it is zero-padded into the filename.
 */
export function buildMiddleware(name: string, index: number): GeneratorResult {
  const slug = kebabCase(name);
  const prefix = String(index).padStart(2, '0');
  const fileName = `${prefix}-${slug}.js`;
  const title = upperFirst(name);

  const contents = `// ${title} middleware — runs in the request pipeline.
// Auto-loaded by server.js (alphabetical). Lower numeric prefixes run first.
export default async (ctx, next) => {
  // --- before the request is handled ---

  await next();

  // --- after the response is produced ---
};
`;

  return {
    files: [{ path: `backend/middleware/${fileName}`, contents }],
    notes: [`Middleware ${fileName} created and auto-loaded on next server start.`],
  };
}
