// MasterController v2 API backend (ESM).
// Boots the framework, auto-loads middleware, registers routes + controllers via
// startMVC(), then listens. The Next.js frontend talks to this over HTTP.
import master from 'mastercontroller';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Environment + application root.
master.root = __dirname;
master.environmentType = process.env.NODE_ENV || 'development';

// 2. Create the HTTP server (wires the framework pipeline).
const server = master.setupServer('http');

// 3. CORS — allow the Next.js frontend origin to call the API from the browser.
master.cors.init({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// 4. Auto-load middleware files (alphabetical; numeric prefixes set the order).
const middlewareDir = join(__dirname, 'middleware');
if (existsSync(middlewareDir)) {
  const files = readdirSync(middlewareDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
  for (const file of files) {
    const mod = await import(pathToFileURL(join(middlewareDir, file)).href);
    const mw = mod.default;
    if (typeof mw === 'function') master.pipeline.use(mw);
    else if (mw && typeof mw.register === 'function') mw.register(master);
  }
}

// 5. Load routes (app/routes.js) and pre-register controllers (app/controllers).
await master.startMVC('app');

// 6. Finalize the pipeline and start the framework.
await master.start(server);

// 7. (Optional) WebSockets — handlers live in app/sockets/<Name>Socket.js.
try {
  await master.socket.init(server);
} catch {
  // socket.io not installed or no sockets in use — safe to ignore.
}

// 8. Listen.
const PORT = parseInt(process.env.PORT, 10) || 3001;
server.listen(PORT, () => {
  console.log(`⚡ MasterController API listening on http://localhost:${PORT}`);
});
