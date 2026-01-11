var master = require('mastercontroller');
var mimes = require('./mime.json');
var request = require('./request.json');
var cors = require('./cors.json');

// ===========================
// 1. MIDDLEWARE REGISTRATION
// ===========================

// Initialize CORS (auto-registers with pipeline)
master.cors.init(cors);

// Initialize sessions (auto-registers with pipeline)
master.sessions.init();

// Initialize timeout system (optional - professional per-request timeout tracking)
master.timeout.init({
    globalTimeout: 120000,  // 120 seconds (2 minutes) default
    enabled: true
});
// Register timeout middleware
master.pipeline.use(master.timeout.middleware());

// Configure route-specific timeouts (optional)
// master.timeout.setRouteTimeout('/api/*', 30000);          // 30 seconds for APIs
// master.timeout.setRouteTimeout('/admin/reports', 300000); // 5 minutes for reports

// Initialize professional error renderer (Rails/Django style)
master.errorRenderer.init({
    templateDir: 'public/errors',  // Error templates directory
    environment: master.environmentType,
    showStackTrace: master.environmentType === 'development'
});

// Auto-discover custom middleware from middleware/ folder
// Files are loaded alphabetically (use 01-, 02- prefixes for ordering)
master.pipeline.discoverMiddleware('middleware');

// Optional: Security middleware
// Uncomment to enable security headers, rate limiting, etc.
// const { pipelineSecurityHeaders, pipelineRateLimit } = require('mastercontroller/security/SecurityMiddleware');
// master.pipeline.use(pipelineSecurityHeaders());
// master.pipeline.use(pipelineRateLimit({ rateLimitMax: 100, rateLimitWindow: 60000 }));

// ===========================
// 2. FRAMEWORK CONFIGURATION
// ===========================

// Initialize request parser
master.request.init(request);

// Initialize error handling
master.error.init(master.env.error);

// Add MIME type mappings
master.router.addMimeList(mimes);

// Initialize Socket.IO
master.socket.init();

// ===========================
// 3. SERVER SETTINGS
// ===========================

master.serverSettings(master.env.server);

// ===========================
// 4. DEPENDENCY INJECTION
// ===========================

// Register singleton services (one instance for entire app lifetime)
// Example: master.addSingleton('db', DatabaseConnection);

// Register scoped services (one instance per request)
// Example: master.addScoped('logger', RequestLogger);

// Register transient services (new instance per access)
// Example: master.addTransient('email', EmailService);

// ===========================
// 5. ROUTES & COMPONENTS
// ===========================

// Load main application routes
master.startMVC("config");

// Load components (self-contained modules)
// Example: master.component("components", "auth");
// Example: master.component("components", "mail");
