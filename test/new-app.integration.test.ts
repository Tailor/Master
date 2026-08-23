import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runNew } from '../src/commands/new.js';

const exists = (p: string) => existsSync(p);
const readJson = async (p: string) => JSON.parse(await readFile(p, 'utf8'));

/**
 * End-to-end scaffolding test: run `master new` (no install, no git) into a temp
 * directory and assert the generated tree is correct and wired to the current
 * library versions.
 */
describe('master new (integration)', () => {
  let workdir: string;
  let appDir: string;
  const origCwd = process.cwd();

  beforeAll(async () => {
    workdir = await mkdtemp(join(tmpdir(), 'master-it-'));
    process.chdir(workdir);
    await runNew('my-app', {
      db: 'sqlite',
      skipInstall: true,
      skipFrontend: false,
      skipGit: true,
    });
    appDir = join(workdir, 'my-app');
  });

  afterAll(async () => {
    process.chdir(origCwd);
    await rm(workdir, { recursive: true, force: true });
  });

  it('creates the monorepo skeleton', () => {
    expect(exists(join(appDir, 'master.config.js'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'server.js'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'app', 'routes.js'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'app', 'models', 'AppContext.js'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'app', 'controllers', 'healthController.js'))).toBe(true);
    expect(exists(join(appDir, 'frontend', 'app', 'page.tsx'))).toBe(true);
    expect(exists(join(appDir, 'frontend', 'app', 'lib', 'api.ts'))).toBe(true);
  });

  it('renames gitignore -> .gitignore (and does not ship the bare file)', () => {
    expect(exists(join(appDir, '.gitignore'))).toBe(true);
    expect(exists(join(appDir, 'gitignore'))).toBe(false);
  });

  it('wires the backend to the current library versions', async () => {
    const pkg = await readJson(join(appDir, 'backend', 'package.json'));
    expect(pkg.type).toBe('module');
    expect(pkg.dependencies.mastercontroller).toMatch(/^\^2\.(1[1-9]|[2-9]\d)\./);
    expect(pkg.dependencies.masterrecord).toMatch(/^\^1\.(2[2-9]|[3-9]\d)\./);
    expect(pkg.scripts.test).toBe('node --test test/*.test.js');
  });

  it('generates an ESM server using the v2 boot sequence with enterprise defaults', async () => {
    const server = await readFile(join(appDir, 'backend', 'server.js'), 'utf8');
    expect(server).toContain("import master from 'mastercontroller'");
    expect(server).toContain("master.setupServer('http')");
    expect(server).toContain("master.addScoped('db', AppContext)"); // request-scoped DbContext, never a singleton
    expect(server).toContain('master.useHealthChecks(');
    expect(server).toContain('master.useOpenApi(');
    expect(server).toContain('master.useResponseCompression()');
    expect(server).toContain('master.useGracefulShutdown()');
    expect(server).toContain("await master.startMVC('app')");
    expect(server).toContain('await master.start(server)');
  });

  it('ships layered configuration, a test environment and an in-process test', () => {
    expect(exists(join(appDir, 'backend', 'config', 'appsettings.json'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'config', 'appsettings.production.json'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'config', 'environments', 'env.test.json'))).toBe(true);
    expect(exists(join(appDir, 'backend', 'test', 'health.test.js'))).toBe(true);
  });

  it('writes a sqlite env keyed by the context name', async () => {
    const env = await readJson(
      join(appDir, 'backend', 'config', 'environments', 'env.development.json'),
    );
    expect(env.AppContext).toEqual({ type: 'better-sqlite3', connection: 'db/' });
  });

  it('names the workspace packages after the app', async () => {
    const root = await readJson(join(appDir, 'package.json'));
    expect(root.name).toBe('my-app');
    expect(root.workspaces).toEqual(['backend', 'frontend']);
  });
});

describe('master new --skip-frontend (integration)', () => {
  let workdir: string;
  const origCwd = process.cwd();

  beforeAll(async () => {
    workdir = await mkdtemp(join(tmpdir(), 'master-it-be-'));
    process.chdir(workdir);
    await runNew('api-only', {
      db: 'postgres',
      skipInstall: true,
      skipFrontend: true,
      skipGit: true,
    });
  });

  afterAll(async () => {
    process.chdir(origCwd);
    await rm(workdir, { recursive: true, force: true });
  });

  it('omits the frontend and flags the config', async () => {
    const appDir = join(workdir, 'api-only');
    expect(exists(join(appDir, 'frontend'))).toBe(false);
    await expect(stat(join(appDir, 'backend', 'server.js'))).resolves.toBeTruthy();
    const config = await readFile(join(appDir, 'master.config.js'), 'utf8');
    expect(config).toContain('frontend: false');
  });

  it('applies the chosen database', async () => {
    const env = await readJson(
      join(workdir, 'api-only', 'backend', 'config', 'environments', 'env.development.json'),
    );
    expect(env.AppContext.type).toBe('postgres');
  });
});
