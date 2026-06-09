/**
 * Model generator.
 *
 * Emits a MasterRecord entity class. Fields are declared as METHODS that receive
 * a builder: `name(db) { db.string(); }`. This is the form MasterRecord's schema
 * builder understands (the object-literal form does not migrate correctly).
 *
 * Accepts `field:type` pairs (e.g. `title:string published:boolean`) and always
 * includes an auto-increment integer primary key `id`.
 */
import { modelClassName } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

/**
 * Map user-facing type aliases to MasterRecord builder methods. Every target is a
 * real builder method (masterrecord >= 1.3.0), so the generated entity uses the
 * native column type rather than falling back to string.
 */
const TYPE_TO_BUILDER: Record<string, string> = {
  string: 'string',
  str: 'string',
  text: 'text',
  mediumtext: 'mediumtext',
  longtext: 'longtext',
  int: 'integer',
  integer: 'integer',
  number: 'integer',
  bigint: 'bigint',
  bool: 'boolean',
  boolean: 'boolean',
  float: 'float',
  decimal: 'decimal',
  time: 'time',
  date: 'date',
  datetime: 'datetime',
  timestamp: 'timestamp',
  json: 'json',
  uuid: 'uuid',
  binary: 'binary',
  blob: 'binary',
};

export interface FieldSpec {
  name: string;
  /** The resolved MasterRecord builder method (e.g. "string", "integer"). */
  builder: string;
}

/** Parse `["title:string", "age:int"]` into resolved builder specs (default string). */
export function parseFields(specs: string[]): FieldSpec[] {
  return specs
    .map((spec) => {
      const [name, rawType] = spec.split(':');
      if (!name) return null;
      const builder = TYPE_TO_BUILDER[(rawType ?? 'string').toLowerCase()] ?? 'string';
      return { name, builder };
    })
    .filter((f): f is FieldSpec => f !== null);
}

function fieldLine(field: FieldSpec): string {
  return `  ${field.name}(db) { db.${field.builder}(); }`;
}

/** Build a MasterRecord entity class for `name` with the given `field:type` specs. */
export function buildModel(name: string, fieldSpecs: string[] = []): GeneratorResult {
  const className = modelClassName(name);
  const fields = parseFields(fieldSpecs);

  const fieldLines = fields.length
    ? fields.map(fieldLine).join('\n')
    : `  name(db) { db.string(); }`;

  const contents = `// ${className} — MasterRecord entity (ESM).
// Each field is a method that receives the schema builder (db).
// Types: string, text, integer, bigint, float, decimal, boolean, time, date,
// datetime, timestamp, json, uuid, binary. Modifiers: .primary(), .auto(),
// .unique(), .nullable(), .default(v). Docs: https://github.com/Tailor/MasterRecord
export default class ${className} {
  id(db) { db.integer().primary().auto(); }
${fieldLines}

  // Relationship example (Post belongs to a ${className}):
  // ${className.toLowerCase()}_id(db) { db.belongsTo('${className}'); }
}
`;

  return {
    files: [{ path: `backend/app/models/${className}.js`, contents }],
    models: [className],
    notes: [
      `Registered ${className} in models/AppContext.js`,
      `Create a migration:  master db new ${className}Init`,
      `Apply migrations:    master db migrate`,
    ],
  };
}
