# Deployment

A Master app is two deployable services: the **Next.js frontend** and the
**MasterController backend**. You can run them on one host or split them across two.

## Runtime

Run Node.js **22.12 or newer** on a supported LTS line, and keep it on the latest patch:
Node.js ships security fixes as patch releases (the 2026-10-20 releases are 22.23.4,
24.22.1 and 26.12.1). Node 20 is end-of-life and gets none. Add `npm audit --omit=dev` to
your release pipeline so a vulnerable dependency fails the build.

npm 12 (and npm 11.19+) blocks dependency install scripts by default. Nothing in a Master
app needs one: `better-sqlite3` loads its prebuilt binary, and Next.js ships its SWC
binaries as packages. Record that once with `npm install-scripts deny better-sqlite3` to
silence the notice (on a platform without a prebuilt SQLite binary, `approve` it instead).

## Build

```bash
master build      # builds the Next.js frontend (the backend is plain ESM — no build)
```

## Run in production

```bash
NODE_ENV=production master start
```

`master start` launches both processes with `NODE_ENV=production`, the backend on
`backendPort` and Next.js on `frontendPort` (see `master.config.js`). Set
`NEXT_PUBLIC_API_URL` to the public backend URL and `FRONTEND_URL` to the public frontend
origin (used for CORS).

## Environment & secrets

- Database credentials live in `backend/config/environments/env.production.json`, keyed by
  the context name (`AppContext`). Keep real secrets out of source — inject them at deploy
  time or load them into that file from your secret store.
- `.env` is git-ignored; copy `.env.example` and fill it in per environment.

## Process management (PM2)

Run each service under a process manager so it restarts on crash and boot.

```bash
npm install -g pm2

# Backend
cd backend
NODE_ENV=production PORT=3001 pm2 start server.js --name my-app-api

# Frontend
cd ../frontend
PORT=3000 NEXT_PUBLIC_API_URL=https://api.example.com pm2 start "npm run start" --name my-app-web

pm2 save
pm2 startup        # generate the boot script (follow the printed instruction)
```

Useful: `pm2 list`, `pm2 logs my-app-api`, `pm2 restart my-app-web`, `pm2 monit`.

## Reverse proxy

Put the frontend and backend behind a reverse proxy (nginx/Caddy) so they share a domain
and TLS. A common layout:

- `https://example.com/`        → Next.js (`:3000`)
- `https://api.example.com/`    → MasterController (`:3001`)

Set `NEXT_PUBLIC_API_URL=https://api.example.com` and
`FRONTEND_URL=https://example.com` accordingly.

## Backend hardening

MasterController ships production security features (HTTPS/HSTS, CSRF, rate limiting,
secure headers). See the [MasterController deployment guide](https://github.com/Tailor/MasterController)
to enable HTTPS in `server.js` and turn on the production checklist.

## Database migrations in CI/CD

Run migrations as a release step before starting the new version:

```bash
cd backend && NODE_ENV=production npx masterrecord update-database AppContext
# or, from the project root:
NODE_ENV=production master db migrate
```
