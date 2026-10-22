import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, readFile, readdir, stat } from 'node:fs/promises';
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
    // 2.12.0 / 1.31.0: patched qs, no url.parse(), Node 22.12+
    expect(pkg.dependencies.mastercontroller).toMatch(/^\^2\.(1[2-9]|[2-9]\d)\./);
    expect(pkg.dependencies.masterrecord).toMatch(/^\^1\.(3[1-9]|[4-9]\d)\./);
    expect(pkg.scripts.test).toBe('node --test test/*.test.js');
  });

  it('pins a Next.js release with the 2026 security fixes', async () => {
    const pkg = await readJson(join(appDir, 'frontend', 'package.json'));
    expect(pkg.dependencies.next).toMatch(/^\^16\.([4-9]|\d{2,})\./);
    // Next 16 removed `next lint`; a script calling it can only fail
    expect(Object.values(pkg.scripts).join(' ')).not.toContain('next lint');
  });

  it('declares a supported Node.js floor', async () => {
    const root = await readJson(join(appDir, 'package.json'));
    expect(root.engines).toEqual({ node: '>=22.12.0' });
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

  it('ships an InitialCreate migration so `master db migrate` works on a fresh app', async () => {
    const dir = join(appDir, 'backend', 'app', 'models', 'db', 'migrations');
    const migration = (await readdir(dir)).find((f) => /^\d+_InitialCreate_migration\.js$/.test(f));
    expect(migration).toBeDefined();
    expect(await readFile(join(dir, migration as string), 'utf8')).toContain('this.createTable(table.User)');
    const snapshot = await readJson(join(dir, 'appcontext_contextSnapShot.json'));
    expect(snapshot.latestMigration).toBe(migration);
    expect(snapshot.contextLocation).toBe('../../AppContext.js');
    expect(snapshot.schema.map((t: { __name: string }) => t.__name)).toEqual(['User']);
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
