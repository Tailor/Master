/**
 * Controller generator.
 *
 * Emits a MasterController v2 API controller: an ESM class with `export default`,
 * a `constructor(requestObject)`, and one action method per requested action that
 * replies with the typed `this.ok(...)` result (ASP.NET ControllerBase.Ok). Also
 * returns the route lines to register.
 */
import { camelCase, controllerClassName, controllerFileName, lowerFirst } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

function actionBody(controllerName: string, action: string): string {
  return `  // GET-by-default action. Reply with JSON for the Next.js frontend to consume.
  async ${action}(obj) {
    this.ok({
      ok: true,
      controller: '${controllerName}',
      action: '${action}',
      params: obj.params,
      user: this.user && this.user.isAuthenticated ? this.user.name : null,
    });
  }`;
}

/**
 * Build a plain controller with the given actions (defaults to `index` if none).
 * `name` is the resource name (e.g. "users"); the URL routes are `/<name>/<action>`
 * with `index` mapped to `/<name>`.
 */
export function buildController(name: string, actions: string[] = []): GeneratorResult {
  const resource = camelCase(name);
  const className = controllerClassName(name);
  const fileName = controllerFileName(name);
  const list = actions.length > 0 ? actions.map(lowerFirst) : ['index'];

  const methods = list.map((action) => actionBody(resource, action)).join('\n\n');

  const contents = `// ${className} — MasterController v2 API controller (ESM).
// Each request constructs a fresh instance; actions receive the request object and
// reply with typed results: this.ok / created / noContent / notFound / problem / file.
// this.db = request-scoped AppContext, this.user = ClaimsPrincipal, this.logger, this.options.
export default class ${className} {
  // Authorization (ASP.NET [Authorize]) once auth is configured in server.js:
  // static authorize = { '*': true, index: false };
  // Model binding + validation (ASP.NET [ApiController]):
  // static schemas = { create: { body: { name: 'string!' } } };

  constructor(requestObject) {
    this.requestObject = requestObject;
  }

${methods}
}
`;

  const routes = list.map((action) => {
    const path = action === 'index' ? `/${resource}` : `/${resource}/${action}`;
    return `router.route('${path}', '${resource}#${action}', 'get');`;
  });

  return {
    files: [{ path: `backend/app/controllers/${fileName}.js`, contents }],
    routes,
    notes: [`Routes registered for ${className}: ${list.join(', ')}`],
  };
}
