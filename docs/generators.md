# Generators

```bash
master generate <type> <name> [extra...]
master g <type> <name> [extra...]          # alias
```

All generators must be run from inside a Master project (a directory with
`master.config.js`, or any subdirectory of one).

## `scaffold` — full CRUD vertical slice

```bash
master g scaffold post title:string body:text
```

Creates and wires up:

- `backend/app/models/Post.js` — a MasterRecord entity, registered in `AppContext.js`
- `backend/app/controllers/postsController.js` — a RESTful JSON controller backed by the
  request-scoped context (`this.db`), with `static schemas` derived from your fields (model
  binding + validation → `this.model`, automatic `400 ValidationProblemDetails`) and typed
  results (`this.ok / created / noContent / notFound`). Uncomment `static authorize` to
  require a signed-in user for writes.
- `frontend/app/posts/page.tsx` — a Next.js list page that fetches `/posts`
- 5 routes in `backend/app/routes.js` (typed `:id(int)` — `/posts/abc` is a 404, not a query):

  | Method | Path | Action |
  | --- | --- | --- |
  | GET | `/posts` | index |
  | GET | `/posts/:id(int)` | show |
  | POST | `/posts` | create |
  | PUT | `/posts/:id(int)` | update |
  | DELETE | `/posts/:id(int)` | destroy |

Then: `master db new AddPosts && master db migrate`. The API is documented automatically at
`/openapi.json` (Swagger UI at `/docs` in development).

## `controller`

```bash
master g controller users index show profile
```

Creates `backend/app/controllers/usersController.js` with one action per name (default
`index`) and a GET route for each. Actions reply with typed results (`this.ok(...)`,
`this.created`, `this.notFound`, `this.problem`, …) and can use `this.db`, `this.user`,
`this.logger`, `this.options`; the template shows where `static authorize` / `static schemas` go.

## `model`

```bash
master g model Comment body:text author:string
```

Creates `backend/app/models/Comment.js` and registers it in `AppContext.js`. Field types:

| Alias | Builder | Column |
| --- | --- | --- |
| `string`, `str` | `db.string()` | string |
| `text` | `db.text()` | text |
| `int`, `integer`, `number` | `db.integer()` | integer |
| `bool`, `boolean` | `db.boolean()` | boolean |
| `time` | `db.time()` | time |

Every model gets an auto-increment `id` primary key. Add relationships and modifiers by
hand — see the [MasterRecord docs](https://github.com/Tailor/MasterRecord):

```js
export default class Comment {
  id(db) { db.integer().primary().auto(); }
  body(db) { db.text(); }
  post_id(db) { db.belongsTo('Post'); }
}
```

## `page`

```bash
master g page about
```

Creates `frontend/app/about/page.tsx`, a Next.js App Router Server Component using the
`api()` helper.

## `socket`

```bash
master g socket chat message typing
```

Creates `backend/app/sockets/chatSocket.js`. Connect from the client with
`io({ query: { socket: 'chat' } })`; emitted event names map to methods
`message(payload, socket, io)`.

## `middleware`

```bash
master g middleware auth
```

Creates `backend/middleware/NN-auth.js` (numeric prefix auto-incremented). Middleware is
auto-loaded by `server.js` in alphabetical order and uses the `(ctx, next)` shape.

## `component`

```bash
master g component billing
```

Creates a mountable mini-app under `components/billing/` (its own routes + controller).
Register it in `server.js`:

```js
await master.component('components', 'billing');
```
