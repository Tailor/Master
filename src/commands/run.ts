/**
 * Next.js-style lifecycle commands: `master dev`, `master build`, `master start`.
 *
 * `dev`   — backend (node --watch) + Next.js dev server, together, with prefixed output.
 * `build` — production build of the frontend.
 * `start` — production: backend + `next start`, together.
 */
import { existsSync } from 'node:fs';
import pc from 'picocolors';
import { findProjectRoot } from '../lib/paths.js';
import { loadConfig } from '../lib/config.js';
import { runConcurrent, runOnce, type ProcSpec } from '../lib/runProcess.js';
import { log } from '../lib/log.js';

async function resolveContext() {
  const root = findProjectRoot();
  if (!root) {
    log.error('Not inside a Master project (no master.config.js found).');
    process.exitCode = 1;
    return null;
  }
  const config = await loadConfig(root);
  return { root, config };
}

function apiUrl(port: number): string {
  return `http://localhost:${port}`;
}

/** `master dev` — run backend + frontend dev servers concurrently. */
export async function runDev(): Promise<void> {
  const ctx = await resolveContext();
  if (!ctx) return;
  const { root, config } = ctx;

  const specs: ProcSpec[] = [
    {
      label: 'backend',
      color: pc.magenta,
      command: 'node',
      args: ['--watch', 'server.js'],
      cwd: `${root}/${config.backendDir}`,
      env: { NODE_ENV: 'development', PORT: String(config.backendPort) },
    },
  ];

  if (config.frontend && existsSync(`${root}/${config.frontendDir}`)) {
    specs.push({
      label: 'frontend',
      color: pc.cyan,
      command: 'npm',
      args: ['run', 'dev'],
      cwd: `${root}/${config.frontendDir}`,
      env: {
        PORT: String(config.frontendPort),
        NEXT_PUBLIC_API_URL: apiUrl(config.backendPort),
      },
    });
  }

  log.step(
    `Starting dev servers  ${pc.dim(`(api :${config.backendPort}${config.frontend ? `, web :${config.frontendPort}` : ''})`)}`,
  );
  const code = await runConcurrent(specs);
  process.exitCode = code;
}

/** `master build` — build the frontend for production. */
export async function runBuild(): Promise<void> {
  const ctx = await resolveContext();
  if (!ctx) return;
  const { root, config } = ctx;

  if (config.frontend && existsSync(`${root}/${config.frontendDir}`)) {
    log.step('Building Next.js frontend…');
    const code = await runOnce('npm', ['run', 'build'], `${root}/${config.frontendDir}`);
    if (code !== 0) {
      process.exitCode = code;
      return;
    }
    log.success('Frontend build complete');
  }
  log.success('Backend is plain ESM — no build step required.');
}

/** `master start` — run backend + frontend in production mode. */
export async function runStart(): Promise<void> {
  const ctx = await resolveContext();
  if (!ctx) return;
  const { root, config } = ctx;

  const specs: ProcSpec[] = [
    {
      label: 'backend',
      color: pc.magenta,
      command: 'node',
      args: ['server.js'],
      cwd: `${root}/${config.backendDir}`,
      env: { NODE_ENV: 'production', PORT: String(config.backendPort) },
    },
  ];

  if (config.frontend && existsSync(`${root}/${config.frontendDir}`)) {
    specs.push({
      label: 'frontend',
      color: pc.cyan,
      command: 'npm',
      args: ['run', 'start'],
      cwd: `${root}/${config.frontendDir}`,
      env: {
        PORT: String(config.frontendPort),
        NEXT_PUBLIC_API_URL: apiUrl(config.backendPort),
      },
    });
  }

  log.step('Starting production servers…');
  const code = await runConcurrent(specs);
  process.exitCode = code;
}
