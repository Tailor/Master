// MasterController v2 API backend (ESM) with enterprise defaults — the same shape
// an ASP.NET Core Program.cs has: a request-scoped database context (like EF's
// DbContext), layered configuration + user secrets, structured logging, health
// endpoints, OpenAPI docs, response compression, graceful shutdown and opt-in JWT
// auth. The Next.js frontend talks to this over HTTP.
import master from 'mastercontroller';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import AppContext from './app/models/AppContext.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

// 1. Environment + application root. NODE_ENV drives both MasterController and
//    MasterRecord (config/environments/env.<NODE_ENV>.json); default to development.
process.env.NODE_ENV ??= 'development';
master.root = __dirname;
master.environmentType = process.env.NODE_ENV;
master.userSecretsId = pkg.name;   // `master secrets set Auth:JwtSecret <value>` keeps dev secrets outside the repo

// 2. Create the HTTP server (wires the pipeline, configuration, logging, hosting).
const server = master.setupServer('http');
// config/appsettings.json < appsettings.{env}.json < config/environments/env.{env}.json
// < user secrets < environment variables (Section__Key) < --Section:Key=value
const config = master.configuration;

// 3. Database — a fresh AppContext per request (ASP.NET/EF: scoped DbContext).
//    Controllers use `this.db`; background jobs use `master.useScope((scope) => scope.db ...)`.
master.addScoped('db', AppContext);

// 4. CORS — allow the Next.js frontend origin to call the API from the browser.
master.cors.init({
  origin: [process.env.FRONTEND_URL || config.get('Frontend:Url', 'http://localhost:3000')],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// 5. Enterprise middleware.
master.useResponseCompression();                                    // gzip / brotli
master.useHealthChecks({                                            // /health/live, /health/ready, /health/report
  path: '/health/report',
  checks: { database: { check: () => master.useScope((scope) => scope.db.canConnect()), tags: ['ready'] } },
});
master.useOpenApi({                                                 // GET /openapi.json (+ /docs UI outside production)
  title: `${pkg.name} API`,
  version: pkg.version,
  ui: master.environment.isProduction ? false : '/docs',
});
master.useGracefulShutdown();                                       // SIGTERM/SIGINT -> drain -> exit

// 6. Authentication (opt-in): set `Auth:JwtSecret` (>= 32 chars) with
//    `master secrets set Auth:JwtSecret <value>` (dev) or the JWT_SECRET / Auth__JwtSecret env var.
//    Then protect routes with { authorize: true } / static authorize — see the docs.
const jwtSecret = config.get('Auth:JwtSecret') || process.env.JWT_SECRET;
if (jwtSecret) {
  master.auth.addJwtBearer('bearer', {
    secret: jwtSecret,
    issuer: config.get('Auth:Issuer', pkg.name),
    expiresIn: config.get('Auth:ExpiresIn', '1h'),
  });
  master.auth.addPolicy('AdminOnly', { roles: ['admin'] });
}

// 7. Auto-load middleware files (alphabetical; numeric prefixes set the order).
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

// 8. Load routes (app/routes.js) and pre-register controllers (app/controllers).
await master.startMVC('app');

// 9. Finalize the pipeline, validate options, start hosted services.
await master.start(server);

// 10. (Optional) WebSockets — handlers live in app/sockets/<Name>Socket.js.
try {
  await master.socket.init(server);
} catch {
  // socket.io not installed or no sockets in use — safe to ignore.
}

// 11. Listen.
const PORT = parseInt(process.env.PORT, 10) || config.get('Server:Port', 3001);
server.listen(PORT, () => {
  master.createLogger('Startup').info('MasterController API listening on http://localhost:{port} ({env})', { port: PORT, env: master.environment.name });
});
