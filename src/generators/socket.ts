/**
 * Socket generator.
 *
 * Emits a MasterController v2 socket controller. The client connects with
 * `io({ query: { socket: '<name>' } })` and emits event names that map to methods
 * `method(payload, socket, io)` on this class.
 */
import { socketClassName, socketFileName } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

/** Build a socket controller with the given event handlers (defaults to `message`). */
export function buildSocket(name: string, events: string[] = []): GeneratorResult {
  const className = socketClassName(name);
  const fileName = socketFileName(name);
  const list = events.length > 0 ? events : ['message'];

  const methods = list
    .map(
      (
        event,
      ) => `  // Client emits '${event}'; reply with socket.emit(...) or io.emit(...) to broadcast.
  async ${event}(payload, socket, io) {
    io.emit('${event}', payload);
  }`,
    )
    .join('\n\n');

  const contents = `// ${className} — MasterController v2 socket controller (ESM).
// Connect from the client with io({ query: { socket: '${name}' } }).
export default class ${className} {
${methods}
}
`;

  return {
    files: [{ path: `backend/app/sockets/${fileName}.js`, contents }],
    notes: [`Socket ${className} created. Connect with io({ query: { socket: '${name}' } }).`],
  };
}
