// Database access OUTSIDE a request (jobs, scripts, hosted services).
//
// Inside controllers use `this.db` — a fresh AppContext per request, registered
// in server.js with master.addScoped('db', AppContext) (ASP.NET/EF: a scoped
// DbContext). A shared/singleton context across requests is NOT safe: it mixes
// the change sets of concurrent requests (MasterRecord docs: "Change tracking is
// a unit of work").
//
//   import { withDb } from './db.js';
//   await withDb(async (db) => { const users = await db.User.toList(); });
import master from 'mastercontroller';

export function withDb(fn) {
  return master.useScope((scope) => fn(scope.db));
}

export default withDb;
