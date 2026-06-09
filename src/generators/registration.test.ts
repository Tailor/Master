import { describe, it, expect } from 'vitest';
import { appendRoutes, registerModel } from './registration.js';

const CONTEXT = `import context from 'masterrecord/context';
import User from './User.js';

class AppContext extends context {
  constructor() {
    super();

    this.env('config/environments');

    this.dbset(User);
  }
}

export default AppContext;
`;

describe('appendRoutes', () => {
  it('appends new route lines', () => {
    const src = `const router = master.router.start();\nrouter.route('/health', 'health#index', 'get');\n`;
    const out = appendRoutes(src, [`router.route('/posts', 'posts#index', 'get');`]);
    expect(out).toContain(`router.route('/posts', 'posts#index', 'get');`);
    expect(out.match(/router\.route/g)?.length).toBe(2);
  });

  it('is idempotent — does not duplicate existing lines', () => {
    const line = `router.route('/posts', 'posts#index', 'get');`;
    const src = `const router = master.router.start();\n${line}\n`;
    const out = appendRoutes(src, [line]);
    expect(out.match(/posts#index/g)?.length).toBe(1);
  });
});

describe('registerModel', () => {
  it('adds an import after the last import and a dbset after the last dbset', () => {
    const out = registerModel(CONTEXT, 'Post');
    expect(out).toContain(`import Post from './Post.js';`);
    expect(out).toContain('this.dbset(Post);');
    // Import order preserved (User before Post).
    expect(out.indexOf(`import User`)).toBeLessThan(out.indexOf(`import Post`));
    // dbset added after existing User dbset.
    expect(out.indexOf('this.dbset(User);')).toBeLessThan(out.indexOf('this.dbset(Post);'));
  });

  it('preserves indentation of the dbset block', () => {
    const out = registerModel(CONTEXT, 'Post');
    expect(out).toContain('    this.dbset(Post);');
  });

  it('is idempotent', () => {
    const once = registerModel(CONTEXT, 'Post');
    const twice = registerModel(once, 'Post');
    expect(twice).toBe(once);
    expect(twice.match(/import Post/g)?.length).toBe(1);
    expect(twice.match(/dbset\(Post\)/g)?.length).toBe(1);
  });
});
