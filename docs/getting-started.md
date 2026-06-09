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

For SQLite this creates `backend/db/appcontext.sqlite`. For MySQL/Postgres, edit the
credentials in `backend/config/environments/env.development.json` first (the config is
keyed by the context name, `AppContext`):

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

## 4. Run it

```bash
master dev
```

- API → <http://localhost:3001>
- Web → <http://localhost:3000>

Both restart on change. Output from each process is prefixed (`[backend]`, `[frontend]`).

## 5. Build a feature

```bash
master g scaffold post title:string body:text
master db new AddPosts
master db migrate
```

You now have a `Post` model, a RESTful `/posts` API, and a `/posts` page. Visit
<http://localhost:3000/posts> and try the API:

```bash
curl -X POST http://localhost:3001/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"World"}'
curl http://localhost:3001/posts
```

## How the pieces connect

- **`backend/server.js`** boots MasterController: `setupServer()` → loads middleware →
  `startMVC('app')` (routes + controllers) → `start()` → `listen()`.
- **`backend/app/routes.js`** maps URLs to `controller#action`.
- **Controllers** reply with `this.returnJson(data)` (or `this.returnError(code, msg)`).
- **`backend/app/models/AppContext.js`** registers entities with `this.dbset(Entity)`.
- **`backend/app/models/db.js`** exports a shared context instance you import in controllers.
- **The frontend** calls the backend through `frontend/app/lib/api.ts` (`api('/posts')`),
  using `NEXT_PUBLIC_API_URL`. CORS is configured in `server.js` for the frontend origin.

Next: [Generators](./generators.md) · [Deployment](./deployment.md)
