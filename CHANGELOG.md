# Changelog

All notable changes to the `master` CLI are documented here. This project adheres to
[Semantic Versioning](https://semver.org).

## [2.1.0]

ASP.NET Core-level scaffold + `dotnet`-style tooling. Validated end to end: a freshly
scaffolded app (sqlite) migrates, passes `master test`, serves CRUD with validation,
typed routes, health, OpenAPI/Swagger UI and compression, and survives 20 concurrent writes.

### Added

- `master db status` / `script [-o file]` / `remove [--force]` (EF `migrations list/script/remove`),
  `--env`. `master db new|migrate|…` **enable migrations automatically** on first use.
- `master secrets set|get|list|remove|clear|path` — development secrets in
  `~/.master/usersecrets/<app>/secrets.json` (the `dotnet user-secrets` equivalent); the
  scaffolded `server.js` sets `master.userSecretsId` so MasterController reads them.
- `master test [--frontend] [--env]` — runs the backend `npm test` (node --test) with `NODE_ENV=test`.
- Scaffold (`master new`): `config/appsettings.json` + `appsettings.production.json`,
  `config/environments/env.test.json` (separate sqlite file), `backend/test/health.test.js`
  (in-process `createTestClient`), `backend` `test` script.

### Changed

- Scaffolded backends pin **mastercontroller ^2.11** and **masterrecord ^1.22**.
- `server.js` now registers the database context **per request** —
  `master.addScoped('db', AppContext)` → `this.db` in controllers (ASP.NET/EF scoped DbContext).
  The old singleton `app/models/db.js` export is gone; `db.js` exports `withDb(fn)` for jobs/scripts.
  `NODE_ENV` defaults to `development`; layered configuration, response compression,
  health endpoints (`/health/live|ready|report` with a database check), OpenAPI (`/openapi.json`,
  Swagger UI at `/docs` outside production), graceful shutdown and opt-in JWT auth
  (`Auth:JwtSecret`) are wired in.
- `scaffold` controllers: `static schemas` generated from the fields (model binding + validation,
  automatic `400 ValidationProblemDetails`), typed results (`ok/created/noContent/notFound`),
  typed `:id(int)` routes, `this.db`, commented `static authorize`.
- `controller` generator emits `this.ok(...)` instead of `this.returnJson(...)`.
- Route parser (`master routes`) handles route options (`router.route(path, to, method, { … })`).
- Docs: getting started (configuration/secrets/auth/test), generators, README, template README.

## [2.0.3]

### Changed

- Scaffolded backends pin `masterrecord@^1.3.1`, which fixes two production
  bugs: Windows-generated migration snapshots crashing Linux deploys
  (`ERR_INVALID_MODULE_SPECIFIER` before any migration ran), and `bulkInsert`
  emitting malformed multi-row INSERTs for heterogeneous batches on
  MySQL/Postgres (silent per-row fallback; possible wrong-column writes).

## [2.0.2]

### Added

- **Rails-style welcome page.** New apps now open to a proper welcome screen
  (like the classic Rails landing page): heroic key art, live frontend/backend
  status checks, "claim the power" next-step cards, and links to masterjs.org
  docs. Lives at `frontend/app/page.tsx`; replace it when you build your home page.
- The welcome art ships with the CLI (`frontend/public/master-welcome.png`).

## [2.0.1]

### Changed

- The `model`/`scaffold` generators now emit native column types using MasterRecord's
  builder methods (`db.datetime()`, `db.float()`, `db.decimal()`, `db.bigint()`,
  `db.json()`, `db.uuid()`, `db.binary()`, `db.date()`/`db.timestamp()`) instead of
  falling back to `string`/`text`. Requires `masterrecord >= 1.3.0`.
- Scaffolded backends now pin `mastercontroller@^2.0.10` and `masterrecord@^1.3.0`.

## [2.0.0]

A complete rebuild. Master is now a modern, Next.js-style CLI that scaffolds and runs
**decoupled full-stack monorepos** (Next.js frontend + MasterController API + MasterRecord ORM).

### Added

- **`master new`** scaffolds a full-stack monorepo: a Next.js (App Router, TypeScript)
  frontend and a MasterController + MasterRecord backend, wired together with CORS and a
  typed `api()` helper. Flags: `--db sqlite|mysql|postgres`, `--skip-install`,
  `--skip-frontend`, `--skip-git`.
- **Next.js-style lifecycle commands**: `master dev` (runs backend + frontend together
  with prefixed, colorized output), `master build`, `master start`.
- **`master db`** — a friendly wrapper over the MasterRecord migration CLI: `migrate`,
  `new`, `rollback`, `enable`, `list`, `ensure`.
- **Generators** (`master g`): `controller`, `model`, `scaffold` (full CRUD: model + REST
  API + Next.js page), `socket`, `middleware`, `component`, `page`. Generators are
  idempotent and automatically register routes (`app/routes.js`) and models (`AppContext.js`).
- **`master routes`** lists registered routes without booting the server.
- A few tasteful Masters-of-the-Universe nods, including the hidden `master power`.

### Changed

- **ESM throughout.** The CLI and every generated backend file use ES modules, matching
  `mastercontroller@^2` and `masterrecord@^1` (both ESM-only).
- Scaffolded apps now pin **`mastercontroller@^2.0.9`** and **`masterrecord@^1.2.10`**
  (previously `^1.2.8` / `^0.2.33`).
- Backend controllers are JSON APIs (`this.returnJson(...)`); the UI now lives in Next.js.
- MasterRecord entities use the fluent builder form (`field(db) { db.string(); }`) — the
  form the schema/migration engine actually supports.
- The CLI is authored in TypeScript, built with `tsup`, and covered by Vitest tests.

### Removed

- The legacy server-rendered HTML view templates, CommonJS scaffolding, and outdated docs
  from the 1.x line.

### Migrating from 1.x

1.x scaffolded a single CommonJS, server-rendered app against old library versions. There
is no in-place upgrade path; create a fresh `master new` app and port your controllers and
models into the new ESM backend (and your views into the Next.js frontend).
