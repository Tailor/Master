/**
 * Project configuration (`master.config.js`) loading + defaults.
 *
 * `master.config.js` is an ESM module at the project root that default-exports a
 * partial config. We load it dynamically and merge it over the defaults so the
 * dev/build/start commands have a stable, fully-populated shape to work with.
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export interface MasterConfig {
  /** Port the MasterController API backend listens on. */
  backendPort: number;
  /** Port the Next.js frontend dev/start server listens on. */
  frontendPort: number;
  /** Folder (relative to root) of the backend app. */
  backendDir: string;
  /** Folder (relative to root) of the Next.js frontend. */
  frontendDir: string;
  /** Whether a Next.js frontend exists in this project. */
  frontend: boolean;
}

export const DEFAULT_CONFIG: MasterConfig = {
  backendPort: 3001,
  frontendPort: 3000,
  backendDir: 'backend',
  frontendDir: 'frontend',
  frontend: true,
};

/**
 * Load and normalize a project's config. Missing keys fall back to defaults so
 * callers never have to null-check individual fields.
 */
export async function loadConfig(projectRoot: string): Promise<MasterConfig> {
  const configPath = join(projectRoot, 'master.config.js');
  if (!existsSync(configPath)) return { ...DEFAULT_CONFIG };

  const mod = await import(pathToFileURL(configPath).href);
  const user = (mod?.default ?? mod) as Partial<MasterConfig>;
  return { ...DEFAULT_CONFIG, ...user };
}
