# Changelog

All notable changes to the `master` CLI are documented here. This project adheres to
[Semantic Versioning](https://semver.org).

## [2.2.1]

### Fixed

- Scaffolded backends pin **masterrecord ^1.31.1**. masterrecord 1.31.0 required
  `better-sqlite3@^13.0.3`, so an app that also pinned better-sqlite3 12 got a second,
  nested 13.x that npm 10 compiles with `node-gyp` — and builds on images without Python
  failed. 1.31.1 accepts `>=12.6.2 <14` again and shares the app's copy.
- `docs/deployment.md`: the install-script note said npm 11.19+ blocks dependency scripts;
  only npm 12 does. It now says what each npm needs for `better-sqlite3` (deny on 13.x
  under npm 12; python3/make/g++ or a pinned 12.x under npm 10/11).

## [2.2.0]

Security maintenance, and two scaffold breaks fixed that the end-to-end check found.
Validated end to end on Node 22.23.4 (npm 10), 24.22.1 and 26.12.1 (npm 11 and npm 12.2.1): a fresh app
installs with **0 vulnerabilities**, `master db migrate` + `master test` pass, a generated
scaffold migrates and serves CRUD, and `master build` builds the Next.js app.

### Security

- Scaffolded backends pin **mastercontroller ^2.12.0** (patched `qs`, no `url.parse()`)
  and **masterrecord ^1.31.0** (patched SQLite via better-sqlite3 13.0.3).
- Scaffolded frontends pin **next ^16.4.2**. Next.js ≤ 16.3.7 is affected by critical
  advisories (among them RCE in the Image Optimization API and in `next/og`, middleware
  bypass, SSRF in Server Actions and rewrites, cache poisoning) and bundles vulnerable
  `postcss` and `sharp`.
- The CLI's own dev toolchain: `vitest` ^4.1.12 (GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8),
  which brings `vite` 8.3.5, `postcss` 8.5.31, patched `nanoid`, `source-map-js`, `js-yaml`
  and `brace-expansion`. `esbuild` is overridden to ^0.28.2 (GHSA-g7r4-m6w7-qqqr) because
  `tsup` 8 caps it at 0.27; the built `dist/` is byte-identical. `npm audit`: 0.

### Changed

- **Requires Node.js 22.12+** (`engines`, also declared in the generated app's root
  `package.json`). Node 20 reached end-of-life on 2026-04-30.
- Scaffolded backends pin `socket.io` ^4.8.4 and the generated app's root pins
  `master` ^2.2.0.

### Fixed

- **`master db migrate` failed on a new app** ("No migration files found"). Since
  masterrecord 1.30.0, applying runs migration files only (EF `database update`), and the
  scaffold shipped a `User` model with no migration. New apps now ship an `InitialCreate`
  migration and its snapshot, the way ASP.NET templates ship theirs, so `npm install` →
  `master db migrate` works as documented. For an app created before 2.2.0,
  `master db migrate` now says what to do instead of passing masterrecord's error
  through: `master db new InitialCreate`, then `master db migrate`.
- **Removed the frontend's `lint` script.** It ran `next lint`, which Next.js 16 removed,
  so it could only fail. `eslint-config-next` was not added in its place: it pulls in
  `braces`, which has an unpatched high-severity advisory (GHSA-vfj7-8cjw-p6xm).

## [2.1.2]

### Changed

- Scaffolded backends pin **masterrecord ^1.30.0**. From 1.30.0 the migration snapshot is
  written when a migration is **authored** (`master db new`) and never when one is
  **applied** (`master db migrate`) — matching EF Core, where `migrations add` regenerates
  ModelSnapshot and `database update` never touches it. That is what guarantees a fresh
  database can replay every migration in order. Also: `count()` returns a number on
  Postgres, and generated `alterColumn` migrations are self-contained (they no longer
  depend on the snapshot lagging, and `down` restores the old column definition).

## [2.1.1]

### Changed

- Scaffolded backends pin **masterrecord ^1.23.0** — entity property reads are ~16x faster
  (one shared prototype per entity type; O(n²) loops over result sets went from minutes to
  seconds) and boolean columns read back as `true`/`false`. No template changes otherwise.

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
