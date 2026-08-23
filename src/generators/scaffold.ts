/**
 * Scaffold generator — the headline command.
 *
 * Produces a full vertical slice for a resource:
 *   - a MasterRecord model (singular)            backend/app/models/<Model>.js
 *   - a RESTful JSON controller (plural)         backend/app/controllers/<resource>Controller.js
 *     using the request-scoped context (this.db), model binding + validation
 *     (static schemas -> this.model, automatic 400 ValidationProblemDetails) and
 *     typed results (ok/created/noContent/notFound) — ASP.NET [ApiController] style
 *   - 5 REST routes (index/show/create/update/destroy) with a typed :id(int) param
 *   - a Next.js list page that fetches the API   frontend/app/<resource>/page.tsx
 *
 * The model is wired into the ORM context and the routes into app/routes.js by the
 * command layer (via the `models` / `routes` fields on the result).
 */
import {
  camelCase,
  controllerClassName,
  controllerFileName,
  kebabCase,
  modelClassName,
  pascalCase,
  pluralize,
  singularize,
} from '../lib/naming.js';
import { buildModel, parseFields, type FieldSpec } from './model.js';
import type { GeneratorResult } from './types.js';

/** MasterRecord builder method -> MasterController validation rule type. */
const BUILDER_TO_RULE: Record<string, string> = {
  string: 'string',
  text: 'string',
  mediumtext: 'string',
  longtext: 'string',
  integer: 'integer',
  bigint: 'integer',
  float: 'number',
  decimal: 'number',
  boolean: 'boolean',
  time: 'string',
  date: 'date',
  datetime: 'datetime',
  timestamp: 'datetime',
  json: 'any',
  uuid: 'uuid',
  binary: 'any',
};

/** Validation rules for the scaffolded controller's `static schemas`. */
export function rulesFor(fields: FieldSpec[], { required }: { required: boolean }): string {
  const list = fields.length ? fields : [{ name: 'name', builder: 'string' }];
  return list
    .map((f) => {
      const type = BUILDER_TO_RULE[f.builder] ?? 'string';
      const parts = [`type: '${type}'`];
      if (required && type !== 'boolean') parts.push('required: true');
      return `${f.name}: { ${parts.join(', ')} }`;
    })
    .join(', ');
}

function crudController(resource: string, model: string, fields: FieldSpec[]): string {
  const className = controllerClassName(resource);
  return `// ${className} — RESTful JSON API backed by MasterRecord.
// this.db is a request-scoped AppContext (ASP.NET/EF: scoped DbContext) — registered in server.js.
// Input is bound + validated from \`static schemas\` into this.model (invalid -> 400 ValidationProblemDetails).
export default class ${className} {
  static schemas = {
    create: { body: { ${rulesFor(fields, { required: true })} } },
    update: { body: { ${rulesFor(fields, { required: false })} } },
  };

  // Protect writes once auth is configured in server.js (ASP.NET [Authorize]):
  // static authorize = { create: true, update: true, destroy: true };

  constructor(requestObject) {
    this.requestObject = requestObject;
  }

  // GET /${resource}
  async index() {
    const data = await this.db.${model}.toList();
    this.ok({ data });
  }

  // GET /${resource}/:id
  async show(obj) {
    const item = await this.db.${model}.find(obj.params.id);
    if (!item) return this.notFound('${model} not found');
    this.ok({ data: item });
  }

  // POST /${resource}
  async create() {
    const item = this.db.${model}.new();
    Object.assign(item, this.model);
    await this.db.saveChanges();
    this.created(\`/${resource}/\${item.id}\`, { data: item });
  }

  // PUT /${resource}/:id
  async update(obj) {
    const item = await this.db.${model}.find(obj.params.id);
    if (!item) return this.notFound('${model} not found');
    Object.assign(item, this.model);
    await this.db.saveChanges();
    this.ok({ data: item });
  }

  // DELETE /${resource}/:id
  async destroy(obj) {
    const item = await this.db.${model}.find(obj.params.id);
    if (!item) return this.notFound('${model} not found');
    this.db.${model}.remove(item);
    await this.db.saveChanges();
    this.noContent();
  }
}
`;
}

function listPage(resource: string, model: string): string {
  const componentName = pascalCase(resource) + 'Page';
  return `// ${resource} — list page (Next.js App Router, Server Component).
import { api } from '../lib/api';

interface ${model} {
  id: number;
  [key: string]: unknown;
}

export default async function ${componentName}() {
  let items: ${model}[] = [];
  try {
    const res = await api('/${resource}');
    items = res.data ?? [];
  } catch {
    // Backend not running yet — start it with \`master dev\`.
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>${pascalCase(resource)}</h1>
      {items.length === 0 ? (
        <p>No ${resource} yet. POST to <code>/${resource}</code> on the API to create one.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>#{item.id}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
`;
}

/**
 * Build a full CRUD scaffold for `name`. The resource (URL/controller) is the
 * plural form; the model is the singular form.
 */
export function buildScaffold(name: string, fieldSpecs: string[] = []): GeneratorResult {
  const resource = camelCase(pluralize(singularize(name)));
  const model = modelClassName(name);
  const controllerFile = controllerFileName(resource);
  const fields = parseFields(fieldSpecs);

  const modelResult = buildModel(singularize(name), fieldSpecs);

  const routes = [
    `router.route('/${resource}', '${resource}#index', 'get');`,
    `router.route('/${resource}/:id(int)', '${resource}#show', 'get');`,
    `router.route('/${resource}', '${resource}#create', 'post');`,
    `router.route('/${resource}/:id(int)', '${resource}#update', 'put');`,
    `router.route('/${resource}/:id(int)', '${resource}#destroy', 'delete');`,
  ];

  return {
    files: [
      ...modelResult.files,
      {
        path: `backend/app/controllers/${controllerFile}.js`,
        contents: crudController(resource, model, fields),
      },
      { path: `frontend/app/${kebabCase(resource)}/page.tsx`, contents: listPage(resource, model) },
    ],
    routes,
    models: modelResult.models,
    notes: [
      `Scaffolded ${model} (model) + ${controllerClassName(resource)} (REST API, validated + typed) + /${resource} page.`,
      `Next:  master db new ${model}Init   then   master db migrate`,
      `Then:  master dev   (API docs at http://localhost:3001/docs)`,
    ],
  };
}
