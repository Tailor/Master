import { describe, it, expect } from 'vitest';
import { parseRoutes } from './routes.js';
import { envConfig } from './new.js';

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
