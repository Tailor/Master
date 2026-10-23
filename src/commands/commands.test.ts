import { describe, it, expect } from 'vitest';
import { parseRoutes } from './routes.js';
import { envConfig } from './new.js';
import { setSecret, getSecret, removeSecret, flattenSecrets, secretsFilePath } from './secrets.js';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DB_ACTIONS, hasMigrations, hasSnapshot } from './db.js';

describe('parseRoutes', () => {
  it('parses single routes', () => {
    const src = `
      router.route('/health', 'health#index', 'get');
      router.route('/posts/:id', 'posts#show', 'get');
    `;
    expect(parseRoutes(src)).toEqual([
      { method: 'GET', path: '/health', to: 'health#index' },
      { method: 'GET', path: '/posts/:id', to: 'posts#show' },
    ]);
  });

  it('expands resources() into 5 REST rows', () => {
    const rows = parseRoutes(`router.resources('posts');`);
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => `${r.method} ${r.path}`)).toEqual([
      'GET /posts',
      'GET /posts/:id',
      'POST /posts',
      'PUT /posts/:id',
      'DELETE /posts/:id',
    ]);
  });
});

describe('envConfig', () => {
  it('builds a sqlite config keyed by AppContext', () => {
    const parsed = JSON.parse(envConfig('sqlite', 'my-app', 'development'));
    expect(parsed.AppContext).toEqual({ type: 'better-sqlite3', connection: 'db/' });
  });

  it('builds postgres/mysql configs with an env-derived database name', () => {
    const pg = JSON.parse(envConfig('postgres', 'my-app', 'production'));
    expect(pg.AppContext.type).toBe('postgres');
    expect(pg.AppContext.database).toBe('my_app_production');
    expect(pg.AppContext.port).toBe(5432);

    const my = JSON.parse(envConfig('mysql', 'shop', 'development'));
    expect(my.AppContext.type).toBe('mysql');
    expect(my.AppContext.port).toBe(3306);
    expect(my.AppContext.database).toBe('shop_development');
  });
});

describe('secrets helpers', () => {
  it('set/get/remove nested Section:Key paths case-insensitively and flatten', () => {
    const data: Record<string, unknown> = {};
    setSecret(data, 'Auth:JwtSecret', 'abc');
    setSecret(data, 'auth:Issuer', 'me');
    expect(data).toEqual({ Auth: { JwtSecret: 'abc', Issuer: 'me' } });
    expect(getSecret(data, 'AUTH:jwtsecret')).toBe('abc');
    expect(flattenSecrets(data)).toEqual([['Auth:JwtSecret', 'abc'], ['Auth:Issuer', 'me']]);
    expect(removeSecret(data, 'Auth:Issuer')).toBe(true);
    expect(removeSecret(data, 'Nope:x')).toBe(false);
    expect(data).toEqual({ Auth: { JwtSecret: 'abc' } });
    process.env.MASTER_USER_SECRETS_PATH = '/tmp/ms';
    expect(secretsFilePath('my app/x')).toBe('/tmp/ms/my_app_x/secrets.json');
    delete process.env.MASTER_USER_SECRETS_PATH;
  });
  it('db actions include the EF migrations commands', () => {
    expect(DB_ACTIONS).toEqual(expect.arrayContaining(['migrate', 'rollback', 'new', 'remove', 'status', 'script', 'enable', 'list', 'ensure']));
  });
});

describe('db migration detection', () => {
  it('finds migration files and snapshots under the backend, ignoring node_modules', () => {
    const dir = mkdtempSync(join(tmpdir(), 'master-db-'));
    try {
      const migrations = join(dir, 'app', 'models', 'db', 'migrations');
      mkdirSync(migrations, { recursive: true });
      mkdirSync(join(dir, 'node_modules', 'pkg'), { recursive: true });
      writeFileSync(join(dir, 'node_modules', 'pkg', '1_Other_migration.js'), '');
      expect(hasMigrations(dir)).toBe(false);
      expect(hasSnapshot(dir)).toBe(false);
      writeFileSync(join(migrations, 'appcontext_contextSnapShot.json'), '{}');
      writeFileSync(join(migrations, '1792686992366_InitialCreate_migration.js'), '');
      expect(hasMigrations(dir)).toBe(true);
      expect(hasSnapshot(dir)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
