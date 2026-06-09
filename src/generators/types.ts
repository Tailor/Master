import type { GeneratedFile } from '../lib/files.js';

export type { GeneratedFile };

/**
 * The result of a generator. `files` are brand-new files to write; `notes` are
 * human-facing next-step hints; `routes`/`models` describe registrations that the
 * command layer applies to existing project files (routes.js / context.js).
 */
export interface GeneratorResult {
  files: GeneratedFile[];
  /** Route lines to append to `backend/app/routes.js`. */
  routes?: string[];
  /** Model class names to register in `backend/app/models/context.js`. */
  models?: string[];
  /** Next-step hints printed after generation. */
  notes?: string[];
}
