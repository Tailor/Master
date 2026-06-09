/**
 * Component generator.
 *
 * A MasterController "component" is a mountable mini-app with its own routes and
 * controllers under `components/<name>/`. It is registered at boot with
 * `await master.component('components', '<name>')`. Layout matches the framework's
 * component discovery: `config/routes.js` + `app/controllers/`.
 */
import { camelCase, controllerClassName, controllerFileName } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

/** Build a component (routes + a starter controller) under `components/<name>/`. */
export function buildComponent(name: string): GeneratorResult {
  const resource = camelCase(name);
  const className = controllerClassName(name);
  const fileName = controllerFileName(name);
  const base = `components/${resource}`;

  const routes = `// Routes for the '${resource}' component. Loaded when the component is registered.
import master from 'mastercontroller';

const router = master.router.start();

router.route('/${resource}', '${resource}#index', 'get');
`;

  const controller = `// ${className} — controller for the '${resource}' component.
export default class ${className} {
  constructor(requestObject) {
    this.requestObject = requestObject;
  }

  async index(obj) {
    this.returnJson({ ok: true, component: '${resource}' });
  }
}
`;

  return {
    files: [
      { path: `${base}/config/routes.js`, contents: routes },
      { path: `${base}/app/controllers/${fileName}.js`, contents: controller },
    ],
    notes: [
      `Component '${resource}' created.`,
      `Register it in backend/server.js (after setupServer):`,
      `    await master.component('components', '${resource}');`,
    ],
  };
}
