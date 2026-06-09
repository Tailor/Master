/**
 * Controller generator.
 *
 * Emits a MasterController v2 API controller: an ESM class with `export default`,
 * a `constructor(requestObject)`, and one action method per requested action that
 * replies with `this.returnJson(...)`. Also returns the route lines to register.
 */
import { camelCase, controllerClassName, controllerFileName, lowerFirst } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

function actionBody(controllerName: string, action: string): string {
  return `  // GET-by-default action. Reply with JSON for the Next.js frontend to consume.
  async ${action}(obj) {
    this.returnJson({
      ok: true,
      controller: '${controllerName}',
      action: '${action}',
      params: obj.params,
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
// Each request constructs a fresh instance; actions receive the request object
// and reply with this.returnJson(...). See https://github.com/Tailor/MasterController
export default class ${className} {
  constructor(requestObject) {
    this.requestObject = requestObject;

    // Example filter — run before specific actions:
    // this.beforeAction(['update', 'destroy'], (obj) => {
    //   if (!isAuthorized(obj)) { return this.returnError(401, 'Unauthorized'); }
    //   this.next();
    // });
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
