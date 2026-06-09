/**
 * Programmatic API surface for the Master CLI.
 *
 * Exposes the pure generators and naming helpers so they can be reused or tested
 * outside the CLI. The executable entry point is ./cli.ts.
 */
export * from './lib/naming.js';
export * from './generators/types.js';
export { buildController } from './generators/controller.js';
export { buildModel, parseFields } from './generators/model.js';
export { buildScaffold } from './generators/scaffold.js';
export { buildSocket } from './generators/socket.js';
export { buildMiddleware } from './generators/middleware.js';
export { buildComponent } from './generators/component.js';
export { buildPage } from './generators/page.js';
export { appendRoutes, registerModel } from './generators/registration.js';
export { parseRoutes } from './commands/routes.js';
export { envConfig } from './commands/new.js';
