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

Open <http://localhost:3000>.

## Commands

| Command | What it does |
| --- | --- |
| `master dev` | Run backend + frontend together (watch mode) |
| `master build` | Build the frontend for production |
| `master start` | Run backend + frontend in production mode |
| `master generate <type> <name>` | Generate code (see below) |
| `master db migrate` | Apply pending migrations |
| `master db new <Name>` | Create a new migration from your models |
| `master db rollback` | Roll back the latest migration |
| `master routes` | List the API routes |

## Generators

```bash
master generate scaffold post title:string body:text   # model + REST API + page
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
│   ├── server.js             # boots MasterController
│   ├── app/
│   │   ├── routes.js         # URL → controller#action
│   │   ├── controllers/      # API controllers (this.json(...))
│   │   ├── models/           # MasterRecord entities + context + db handle
│   │   └── sockets/          # WebSocket controllers
│   ├── middleware/           # auto-loaded request pipeline
│   └── config/environments/  # per-env database config
└── frontend/
    └── app/                  # Next.js App Router (page.tsx, layout.tsx, lib/api.ts)
```

## Configuration

- **Database** — edit `backend/config/environments/env.<NODE_ENV>.json` (keyed by `AppContext`).
- **Ports / frontend toggle** — edit `master.config.js`.
- **API base URL / CORS** — `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` (see `.env.example`).

By the power of Grayskull — happy building!
