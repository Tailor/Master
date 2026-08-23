import { describe, it, expect } from 'vitest';
import { buildController } from './controller.js';
import { buildModel, parseFields } from './model.js';
import { buildScaffold } from './scaffold.js';
import { buildSocket } from './socket.js';
import { buildMiddleware } from './middleware.js';
import { buildComponent } from './component.js';
import { buildPage } from './page.js';

const fileAt = (files: { path: string; contents: string }[], suffix: string) =>
  files.find((f) => f.path.endsWith(suffix));

describe('buildController', () => {
  it('emits an API controller class with typed-result actions + routes', () => {
    const r = buildController('users', ['index', 'show']);
    const file = fileAt(r.files, 'usersController.js')!;
    expect(file.contents).toContain('export default class UsersController');
    expect(file.contents).toContain('async index(obj)');
    expect(file.contents).toContain('async show(obj)');
    expect(file.contents).toContain('this.ok(');
    expect(file.contents).not.toContain('this.returnJson(');
    expect(r.routes).toContain(`router.route('/users', 'users#index', 'get');`);
    expect(r.routes).toContain(`router.route('/users/show', 'users#show', 'get');`);
  });

  it('defaults to an index action when none given', () => {
    const r = buildController('widgets', []);
    expect(fileAt(r.files, 'widgetsController.js')!.contents).toContain('async index(obj)');
  });
});

describe('parseFields / buildModel', () => {
  it('maps type aliases to builder methods', () => {
    expect(parseFields(['title:string', 'count:int', 'done:bool', 'bio:text'])).toEqual([
      { name: 'title', builder: 'string' },
      { name: 'count', builder: 'integer' },
      { name: 'done', builder: 'boolean' },
      { name: 'bio', builder: 'text' },
    ]);
  });

  it('maps the date/numeric/json aliases to native builder methods (masterrecord >= 1.3.0)', () => {
    expect(parseFields(['at:datetime', 'on:date', 'ts:timestamp', 'price:float', 'qty:decimal'])).toEqual([
      { name: 'at', builder: 'datetime' },
      { name: 'on', builder: 'date' },
      { name: 'ts', builder: 'timestamp' },
      { name: 'price', builder: 'float' },
      { name: 'qty', builder: 'decimal' },
    ]);
    expect(parseFields(['meta:json', 'ref:uuid', 'big:bigint', 'raw:blob'])).toEqual([
      { name: 'meta', builder: 'json' },
      { name: 'ref', builder: 'uuid' },
      { name: 'big', builder: 'bigint' },
      { name: 'raw', builder: 'binary' },
    ]);
  });

  it('emits a fluent-builder entity (methods, not object literals)', () => {
    const r = buildModel('post', ['title:string', 'body:text']);
    const file = fileAt(r.files, 'Post.js')!;
    expect(file.contents).toContain('export default class Post');
    expect(file.contents).toContain('id(db) { db.integer().primary().auto(); }');
    expect(file.contents).toContain('title(db) { db.string(); }');
    expect(file.contents).toContain('body(db) { db.text(); }');
    // Must NOT use the broken object-literal form.
    expect(file.contents).not.toMatch(/this\.\w+ = \{ type:/);
    expect(r.models).toEqual(['Post']);
  });

  it('singularizes the model name', () => {
    expect(fileAt(buildModel('users').files, '.js')!.path).toContain('User.js');
  });
});

describe('buildScaffold', () => {
  it('produces model + REST controller + page, wired to ORM + routes', () => {
    const r = buildScaffold('post', ['title:string', 'body:text']);
    expect(fileAt(r.files, 'models/Post.js')).toBeTruthy();
    expect(fileAt(r.files, 'controllers/postsController.js')).toBeTruthy();
    expect(fileAt(r.files, 'posts/page.tsx')).toBeTruthy();

    const controller = fileAt(r.files, 'postsController.js')!.contents;
    expect(controller).not.toContain(`import db from '../models/db.js';`);
    expect(controller).toContain('await this.db.Post.toList();');
    expect(controller).toContain('this.db.Post.find(obj.params.id)');
    expect(controller).toContain("this.notFound('Post not found')");
    expect(controller).toContain('static schemas = {');
    expect(controller).toContain("title: { type: 'string', required: true }");
    expect(controller).toContain("body: { type: 'string', required: true }");
    expect(controller).toContain('this.created(`/posts/${item.id}`');
    expect(controller).toContain('this.noContent();');

    expect(r.models).toEqual(['Post']);
    expect(r.routes).toContain(`router.route('/posts/:id(int)', 'posts#destroy', 'delete');`);
  });

  it('pluralizes the resource and singularizes the model', () => {
    const r = buildScaffold('categories');
    expect(fileAt(r.files, '.js')!.path).toContain('Category.js');
    expect(r.routes?.[0]).toContain('/categories');
  });
});

describe('buildSocket / buildMiddleware / buildComponent / buildPage', () => {
  it('socket controller exposes event methods', () => {
    const r = buildSocket('chat', ['message', 'typing']);
    const file = fileAt(r.files, 'chatSocket.js')!;
    expect(file.contents).toContain('export default class ChatSocket');
    expect(file.contents).toContain('async message(payload, socket, io)');
    expect(file.contents).toContain('async typing(payload, socket, io)');
  });

  it('middleware uses a numeric prefix and the (ctx, next) shape', () => {
    const r = buildMiddleware('auth', 3);
    const file = r.files[0]!;
    expect(file.path).toBe('backend/middleware/03-auth.js');
    expect(file.contents).toContain('export default async (ctx, next) =>');
    expect(file.contents).toContain('await next();');
  });

  it('component scaffolds routes + controller', () => {
    const r = buildComponent('billing');
    expect(fileAt(r.files, 'config/routes.js')).toBeTruthy();
    expect(fileAt(r.files, 'billingController.js')).toBeTruthy();
  });

  it('page is a Next.js App Router server component', () => {
    const r = buildPage('about-us');
    const file = fileAt(r.files, 'about-us/page.tsx')!;
    expect(file.contents).toContain('export default async function AboutUsPage()');
    expect(file.contents).toContain(`from '../lib/api'`);
  });
});
