# Master App ⚡

A full-stack application built with the **Master** framework:

- **`frontend/`** — a [Next.js](https://nextjs.org) App Router app (your UI)
- **`backend/`** — a [MasterController](https://github.com/Tailor/MasterController) API + [MasterRecord](https://github.com/Tailor/MasterRecord) ORM

The two run side by side; the frontend talks to the backend over HTTP.

## Getting started

```bash
npm install          # install backend + frontend (npm workspaces)
master db migrate    # create the database schema
master dev           # start the API (:3001) and the Next.js app (:3000)
```

Open <http://localhost:3000>. API docs: <http://localhost:3001/docs>.

## Commands

| Command | What it does |
| --- | --- |
| `master dev` | Run backend + frontend together (watch mode) |
| `master build` | Build the frontend for production |
| `master start` | Run backend + frontend in production mode |
| `master generate <type> <name>` | Generate code (see below) |
| `master db migrate` | Apply pending migrations |
| `master db new <Name>` | Create a new migration from your models |
| `master db status` / `script` / `rollback` / `remove` | Inspect, script, revert or delete migrations |
| `master secrets set <Key> <value>` | Development secrets outside the repo (`master secrets list`) |
| `master test` | Run `backend/test/*.test.js` (node --test, NODE_ENV=test) |
| `master routes` | List the API routes |

## Generators

```bash
master generate scaffold post title:string body:text   # model + validated REST API + page
master generate controller users index show             # API controller + routes
master generate model Comment body:text postId:int      # MasterRecord entity
master generate page about                               # Next.js page
master generate socket chat message                      # WebSocket controller
master generate middleware auth                          # pipeline middleware
```

## Project layout

```
.
├── master.config.js          # ports + frontend toggle
├── backend/
│   ├── server.js             # boots MasterController (scoped DbContext, config, health, OpenAPI, auth)
│   ├── app/
│   │   ├── routes.js         # URL → controller#action (+ authorize / typed params)
│   │   ├── controllers/      # API controllers: this.db, this.model, this.ok/created/notFound…
│   │   ├── models/           # MasterRecord entities + AppContext (+ db.js withDb() for jobs)
│   │   └── sockets/          # WebSocket controllers
│   ├── middleware/           # auto-loaded request pipeline
│   ├── config/
│   │   ├── appsettings.json  # layered configuration (+ appsettings.production.json)
│   │   └── environments/     # per-env database config (development / test / production)
│   └── test/                 # in-process integration tests (master test)
└── frontend/
    └── app/                  # Next.js App Router (page.tsx, layout.tsx, lib/api.ts)
```

## Configuration

- **Settings** — `backend/config/appsettings.json` < `appsettings.<NODE_ENV>.json` < user secrets
  (`master secrets`) < environment variables (`Section__Key`). Read with
  `master.configuration.get('Auth:Issuer')` or `this.configuration` in a controller.
- **Database** — `backend/config/environments/env.<NODE_ENV>.json` (keyed by `AppContext`).
- **Auth** — set `Auth:JwtSecret` (`master secrets set Auth:JwtSecret …` / `Auth__JwtSecret`) to
  enable JWT bearer auth; protect routes with `{ authorize: true }` or `static authorize`.
- **Ports / frontend toggle** — `master.config.js`.
- **API base URL / CORS** — `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` (see `.env.example`).
- **Health** — `/health`, `/health/live`, `/health/ready`, `/health/report`.

By the power of Grayskull — happy building!
