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

/** Map user-facing type aliases to MasterRecord builder methods. */
const TYPE_TO_BUILDER: Record<string, string> = {
  string: 'string',
  str: 'string',
  text: 'text',
  mediumtext: 'mediumtext',
  longtext: 'longtext',
  int: 'integer',
  integer: 'integer',
  number: 'integer',
  bool: 'boolean',
  boolean: 'boolean',
  time: 'time',
  // No native datetime/float column — store as text/string.
  date: 'string',
  datetime: 'string',
  timestamp: 'string',
  float: 'string',
  decimal: 'string',
  json: 'text',
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
// Types: string, text, integer, boolean, time. Modifiers: .primary(), .auto(),
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
