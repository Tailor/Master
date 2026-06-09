<div align="center">

# ⚡ Master

**The command center for the Master framework.**

The `master` CLI scaffolds and runs full-stack applications the way `create-next-app`
made Next.js effortless — one command to a working app, one command to run it, and
generators for everything in between.

Every app is a clean, decoupled monorepo:

**[Next.js](https://nextjs.org) frontend** · **[MasterController](https://github.com/Tailor/MasterController) API** · **[MasterRecord](https://github.com/Tailor/MasterRecord) ORM**

[![npm](https://img.shields.io/npm/v/master.svg)](https://www.npmjs.com/package/master)
[![node](https://img.shields.io/node/v/master.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/master.svg)](./LICENSE)

</div>

---

## Install

```bash
npm install -g master
```

Requires **Node.js ≥ 20**.

## Quick start

```bash
master new my-app        # scaffold a full-stack monorepo
cd my-app
master db migrate        # create the database schema (SQLite by default)
master dev               # run the API (:3001) + Next.js (:3000) together
```

Open <http://localhost:3000> — the homepage talks to the backend's `/health` endpoint
to prove the full stack is wired together.

```
master new my-app --db postgres     # choose your database
master new my-app --skip-frontend   # backend-only (no Next.js)
master new my-app --skip-install    # skip npm install
```

## What you get

```
my-app/
├── master.config.js          # ports + frontend toggle
├── backend/                   # MasterController API + MasterRecord ORM (ESM)
│   ├── server.js              # boots the framework
│   ├── app/
│   │   ├── routes.js          # URL → controller#action
│   │   ├── controllers/       # API controllers (this.returnJson(...))
│   │   ├── models/            # MasterRecord entities, AppContext, db handle
│   │   └── sockets/           # WebSocket controllers
│   ├── middleware/            # auto-loaded request pipeline
│   └── config/environments/   # per-env database config
└── frontend/                  # Next.js App Router (TypeScript)
    └── app/                   # page.tsx, layout.tsx, lib/api.ts
```

The two halves run side by side. The frontend reaches the backend through the typed
`api()` helper (`frontend/app/lib/api.ts`); CORS is pre-configured on the backend.

## Commands

| Command | Description |
| --- | --- |
| `master new <name>` | Scaffold a new full-stack app |
| `master dev` *(alias `s`)* | Run backend + frontend together (watch mode) |
| `master build` | Build the frontend for production |
| `master start` | Run backend + frontend in production mode |
| `master generate <type> <name>` *(alias `g`)* | Generate code (see below) |
| `master db <action> [name]` | Run database migrations (MasterRecord) |
| `master routes` | List the registered API routes |
| `master info` | Framework + environment info |

### Generators

```bash
master g scaffold post title:string body:text   # model + REST API + Next.js page
master g controller users index show             # API controller + routes
master g model Comment body:text                 # MasterRecord entity (+ registered)
master g page about                              # Next.js App Router page
master g socket chat message                     # WebSocket controller
master g middleware auth                          # request-pipeline middleware
master g component billing                        # mountable backend component
```

Generators are **idempotent and wiring-aware**: `scaffold`/`controller` append their
routes to `app/routes.js`, and `model`/`scaffold` register the entity in `AppContext.js`
for you.

### Database

```bash
master db migrate          # apply pending migrations (update-database)
master db new AddPosts     # create a migration from your current models
master db rollback         # roll back the latest migration
master db enable           # enable migrations (one-time)
master db list             # list migration files
```

`master db` is a thin, friendly wrapper around the [`masterrecord`](https://github.com/Tailor/MasterRecord)
migration CLI, always run inside `backend/` with the right context and environment.

## Field types

Models use MasterRecord's fluent builder. `master g model`/`scaffold` accept `name:type`:

| Alias | Column |
| --- | --- |
| `string`, `str` | string |
| `text` | text |
| `int`, `integer`, `number` | integer |
| `bigint` | bigint |
| `float` | float |
| `decimal` | decimal |
| `bool`, `boolean` | boolean |
| `date` | date |
| `datetime`, `timestamp` | datetime / timestamp |
| `time` | time |
| `json` | json |
| `uuid` | uuid |
| `binary`, `blob` | binary |

```js
// backend/app/models/Post.js
export default class Post {
  id(db) { db.integer().primary().auto(); }
  title(db) { db.string(); }
  body(db) { db.text(); }
}
```

See the [MasterRecord docs](https://github.com/Tailor/MasterRecord) for relationships
(`belongsTo`, `hasMany`), transformers, and the full query API.

## Documentation

- [Getting started](./docs/getting-started.md)
- [Generators](./docs/generators.md)
- [Deployment](./docs/deployment.md)

## Contributing

```bash
git clone https://github.com/Tailor/Master.git
cd Master
npm install
npm test          # vitest (unit + integration)
npm run build     # tsup → dist/
npm run lint
```

The CLI is written in TypeScript (`src/`), built with `tsup`, and tested with Vitest.
Generators are pure functions (string in, file descriptors out) so they're easy to test.

## License

[MIT](./LICENSE) — *By the power of Grayskull, you have the power.* ⚡
