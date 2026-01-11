var master = require('mastercontroller');

// ===========================
// COMPONENT CONFIGURATION
// ===========================

// Components are self-contained modules with their own:
// - Routes (config/routes.js)
// - Controllers (app/controllers/)
// - Views (app/views/)
// - Models (app/models/)

// Components can register their own middleware, services, and configuration.

// ===========================
// MIDDLEWARE (Optional)
// ===========================

// Components can register custom middleware
// Example:
// master.pipeline.use(async (ctx, next) => {
//     console.log('[Component] Processing request');
//     await next();
// });

// ===========================
// DEPENDENCY INJECTION (Optional)
// ===========================

// Register component-specific services
// Example: master.addSingleton('componentService', ComponentService);

// ===========================
// CONFIGURATION (Optional)
// ===========================

// Component-specific configuration
// Example:
// const config = require('./component-config.json');
// master.componentConfig = config;
