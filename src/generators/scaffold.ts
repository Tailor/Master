/**
 * Scaffold generator — the headline command.
 *
 * Produces a full vertical slice for a resource:
 *   - a MasterRecord model (singular)            backend/app/models/<Model>.js
 *   - a RESTful JSON controller (plural)         backend/app/controllers/<resource>Controller.js
 *   - 5 REST routes (index/show/create/update/destroy)
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
import { buildModel } from './model.js';
import type { GeneratorResult } from './types.js';

function crudController(resource: string, model: string): string {
  const className = controllerClassName(resource);
  return `// ${className} — RESTful JSON API backed by MasterRecord.
import db from '../models/db.js';

export default class ${className} {
  constructor(requestObject) {
    this.requestObject = requestObject;
  }

  // GET /${resource}
  async index() {
    const data = await db.${model}.toList();
    this.returnJson({ data });
  }

  // GET /${resource}/:id
  async show(obj) {
    const item = await db.${model}.where((m) => m.id == $$, Number(obj.params.id)).single();
    if (!item) return this.returnError(404, 'Not found');
    this.returnJson({ data: item });
  }

  // POST /${resource}
  async create(obj) {
    const item = db.${model}.new();
    Object.assign(item, obj.params.formData || {});
    await item.save();
    this.returnJson({ data: item });
  }

  // PUT /${resource}/:id
  async update(obj) {
    const item = await db.${model}.where((m) => m.id == $$, Number(obj.params.id)).single();
    if (!item) return this.returnError(404, 'Not found');
    Object.assign(item, obj.params.formData || {});
    await item.save();
    this.returnJson({ data: item });
  }

  // DELETE /${resource}/:id
  async destroy(obj) {
    const item = await db.${model}.where((m) => m.id == $$, Number(obj.params.id)).single();
    if (!item) return this.returnError(404, 'Not found');
    db.${model}.remove(item);
    await db.saveChanges();
    this.returnJson({ ok: true });
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

  const modelResult = buildModel(singularize(name), fieldSpecs);

  const routes = [
    `router.route('/${resource}', '${resource}#index', 'get');`,
    `router.route('/${resource}/:id', '${resource}#show', 'get');`,
    `router.route('/${resource}', '${resource}#create', 'post');`,
    `router.route('/${resource}/:id', '${resource}#update', 'put');`,
    `router.route('/${resource}/:id', '${resource}#destroy', 'delete');`,
  ];

  return {
    files: [
      ...modelResult.files,
      {
        path: `backend/app/controllers/${controllerFile}.js`,
        contents: crudController(resource, model),
      },
      { path: `frontend/app/${kebabCase(resource)}/page.tsx`, contents: listPage(resource, model) },
    ],
    routes,
    models: modelResult.models,
    notes: [
      `Scaffolded ${model} (model) + ${controllerClassName(resource)} (REST API) + /${resource} page.`,
      `Next:  master db new ${model}Init   then   master db migrate`,
      `Then:  master dev`,
    ],
  };
}
