// User — an example MasterRecord entity.
// Each field is a method that receives the schema builder (db). MasterRecord uses
// these to build the table when you run migrations.
// Types: string, text, integer, boolean, time.
// Modifiers: .primary(), .auto(), .unique(), .nullable(), .default(value).
export default class User {
  id(db) { db.integer().primary().auto(); }
  name(db) { db.string(); }
  email(db) { db.string().unique(); }
}
