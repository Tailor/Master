// User — an example MasterRecord entity.
// Each field is a method that receives the schema builder (db). MasterRecord uses
// these to build the table when you run migrations.
// Types: string, text, integer, bigint, float, decimal, boolean, time, date, datetime,
// timestamp, json, uuid, binary. Modifiers: .primary(), .auto(), .unique(), .nullable(),
// .default(value), .defaultSql('CURRENT_TIMESTAMP'), .computed(sql), .check(sql),
// .rowVersion(), .concurrencyToken(). Relationships: belongsTo / hasMany / hasOne /
// manyToMany. Docs: https://masterjs.org/masterrecord
export default class User {
  id(db) { db.integer().primary().auto(); }
  name(db) { db.string(); }
  email(db) { db.string().unique(); }
  createdAt(db) { db.datetime().defaultSql('CURRENT_TIMESTAMP'); }
}
