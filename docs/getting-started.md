# Getting started

This guide takes you from zero to a running full-stack Master app.

## Prerequisites

- **Node.js ≥ 20**
- npm (bundled with Node)
- For MySQL/PostgreSQL apps: a running database server. SQLite (the default) needs nothing.

## 1. Install the CLI

```bash
npm install -g master
master info        # prints the banner + your Node/platform
```

## 2. Create an app

```bash
master new my-app
cd my-app
```

This scaffolds a monorepo and runs `npm install` + `git init` for you (skip either with
`--skip-install` / `--skip-git`). Choose a database with `--db`:

```bash
master new my-app --db postgres
master new my-app --db mysql
master new my-app --db sqlite      # default
```

## 3. Set up the database

```bash
master db migrate
```

For SQLite this creates `backend/db/appcontext.sqlite` (and `db/test/` for `master test`).
For MySQL/Postgres, edit the credentials in `backend/config/environments/env.development.json`
first (the config is keyed by the context name, `AppContext`):

```json
{
  "AppContext": {
    "type": "postgres",
    "host": "127.0.0.1",
    "port": 5432,
    "database": "my_app_development",
    "user": "postgres",
    "password": ""
  }
}
```

`master db new <Name>` creates a migration from your models (migrations are enabled
automatically on first use), `master db status` shows applied/pending, `master db script`
prints the SQL without applying it, `master db rollback` reverts the latest one.

## 4. Run it

```bash
master dev
```

- API → <http://localhost:3001> (OpenAPI at `/openapi.json`, Swagger UI at `/docs`)
- Web → <http://localhost:3000>

Both restart on change. Output from each process is prefixed (`[backend]`, `[frontend]`).

## 5. Build a feature

```bash
master g scaffold post title:string body:text published:bool
master db new AddPosts
master db migrate
```

You now have a `Post` model, a RESTful, validated `/posts` API, and a `/posts` page. Visit
<http://localhost:3000/posts> and try the API:

```bash
curl -X POST http://localhost:3001/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"World","published":true}'     # 201 + Location: /posts/1
curl -X POST http://localhost:3001/posts -H 'Content-Type: application/json' -d '{}'
#   400 ValidationProblemDetails: {"errors":{"title":["title is required"], ...}}
curl http://localhost:3001/posts/abc                           # 404 — :id(int) is typed
curl http://localhost:3001/posts
```

The generated controller shows the whole ASP.NET-style toolkit in ~40 lines:

```js
export default class PostsController {
  static schemas = {                                   // model binding + validation -> this.model
    create: { body: { title: { type: 'string', required: true }, /* … */ } },
    update: { body: { title: { type: 'string' }, /* … */ } },
  };
  // static authorize = { create: true, update: true, destroy: true };   // [Authorize]

  async index()   { this.ok({ data: await this.db.Post.toList() }); }   // this.db = per-request AppContext
  async show(obj) { const item = await this.db.Post.find(obj.params.id); if (!item) return this.notFound('Post not found'); this.ok({ data: item }); }
  async create()  { const item = this.db.Post.new(); Object.assign(item, this.model); await this.db.saveChanges(); this.created(`/posts/${item.id}`, { data: item }); }
  // update / destroy …
}
```

## 6. Configuration, secrets and authentication

`backend/server.js` builds configuration the way ASP.NET Core does —
`config/appsettings.json` < `appsettings.{NODE_ENV}.json` < `config/environments/env.{NODE_ENV}.json`
< **user secrets** < environment variables (`Section__Key`) < `--Section:Key=value` — and
exposes it as `master.configuration.get('Auth:Issuer')` / `this.configuration` in controllers.

```bash
master secrets set Auth:JwtSecret "$(openssl rand -hex 32)"   # dev only; stored outside the repo
master secrets list                                           # masked; --reveal to show
master secrets path
```

When `Auth:JwtSecret` (or `JWT_SECRET`) is present, `server.js` registers a JWT bearer
scheme and an `AdminOnly` policy. Protect routes with `{ authorize: true }` in `routes.js`,
`static authorize = …` on a controller, or `router.group('/admin', { authorize: 'AdminOnly' }, …)`;
`this.user` is the caller's `ClaimsPrincipal`. In production set `Auth__JwtSecret` as an
environment variable. Full reference: the MasterController
[authentication docs](https://github.com/Tailor/MasterController/blob/master/docs/AUTHENTICATION.md).

## 7. Test

```bash
master test            # backend: node --test test/*.test.js with NODE_ENV=test
master test --frontend # also run the frontend's test script
```

`backend/test/health.test.js` shows the in-process style (no ports, real pipeline):

```js
const client = await master.createTestClient({ root, app: 'app', environment: 'test' });
const res = await client.get('/health');
assert.equal(res.json().ok, true);
```

## How the pieces connect

- **`backend/server.js`** boots MasterController: `setupServer()` → configuration →
  `master.addScoped('db', AppContext)` → CORS → compression / health / OpenAPI / graceful
  shutdown → optional JWT auth → middleware → `startMVC('app')` (routes + controllers) →
  `start()` → `listen()`.
- **`backend/app/routes.js`** maps URLs to `controller#action`, with options such as
  `{ authorize, allowAnonymous, outputCache, apiVersion, name }` and typed params (`:id(int)`).
- **Controllers** get `this.db` (a fresh `AppContext` per request), `this.model` /
  `this.modelState` (bound + validated input), `this.user`, `this.logger`, `this.options`,
  and reply with typed results: `this.ok / created / noContent / notFound / problem / file`.
- **`backend/app/models/AppContext.js`** registers entities with `this.dbset(Entity)`.
- **`backend/app/models/db.js`** exports `withDb(fn)` for work *outside* a request (jobs,
  scripts); it runs `fn` inside a DI scope so the context is disposed afterwards.
- **Health**: `/health` (welcome page), `/health/live`, `/health/ready` (runs the database
  check), `/health/report`.
- **The frontend** calls the backend through `frontend/app/lib/api.ts` (`api('/posts')`),
  using `NEXT_PUBLIC_API_URL`. CORS is configured in `server.js` for the frontend origin.

Next: [Generators](./generators.md) · [Deployment](./deployment.md)
