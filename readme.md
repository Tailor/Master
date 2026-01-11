# Master CLI

A batteries-included Node.js web application toolkit for building data-backed apps with clear layers: routing, controllers, views, middleware, sockets, and records. Master focuses on convention over configuration to help you scaffold and ship fast.

Under the hood, the runtime uses two companion libraries:
- **mastercontroller**: Provides the HTTP server, routing, middleware pipeline, controller base methods, templating hooks, sessions, requests, CORS, sockets, and more.
- **masterrecord**: Lightweight data-access layer for models/records.

The CLI ties these together so you can generate apps and features with a single command.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [What's New in v2.0](#whats-new-in-v20)
- [CLI Commands](#cli-commands)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Middleware System](#middleware-system)
- [Routing](#routing)
- [Controllers](#controllers)
- [Dependency Injection](#dependency-injection)
- [Components](#components)
- [Development Workflow](#development-workflow)
- [Cross-Platform Notes](#cross-platform-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features
- **Project scaffolding** with sensible defaults
- **Generators** for controllers, views, middleware, sockets, components, and full scaffolds
- **Middleware pipeline** (ASP.NET Core style) with Use/Run/Map patterns
- **Auto-discovery** of middleware from `middleware/` folder
- **File-based routing** via `config/routes.js` with RESTful resources
- **Route parameter casing preservation** (`:userId` stays as `:userId`)
- **Dependency injection** with Singleton, Scoped, and Transient lifetimes
- **Component architecture** for self-contained modules
- **Server bootstrap** via `mastercontroller`
- **Template system** with layouts and partials
- **View pattern hooks** via `master.extendView()`
- **Sessions & CORS** with auto-registration
- **Security middleware** (CSRF, rate limiting, security headers)
- **Optional realtime** via Socket.IO
- **Error handling** with custom error pages
- **HTTPS support** with TLS 1.2+ and HTTP/2
- **Cross-platform** (macOS, Windows, Linux)

### New in v2.0
- Middleware pipeline system with Use/Run/Map/useError
- Auto-discovery of middleware from folders
- Route parameter casing bug fix
- Simplified setup (no manual `addInternalTools()`)
- Before/After action filters in controllers
- Complete RESTful scaffolding
- Enhanced CLI with colored output
- Comprehensive documentation (QUICKSTART, CHANGELOG)

---

## Installation

### Global Installation

```bash
npm install -g master
```

### From Source (for development)

```bash
git clone https://github.com/alexanderrich/master.git
cd master
npm install -g ./
```

### Verify Installation

```bash
master --version
```

---

## Quick Start

### Create a New Application

```bash
# Create new app
master new myapp
cd myapp

# Start the server
master server
```

Visit http://localhost:8080 (default port - configured in `config/environments/env.development.json`)

### Generate a Controller

```bash
# Generate controller with actions
master generate controller Users index show new create edit update destroy

# Generate views for controller
master generate view Users index show new edit
```

### Add Custom Middleware

```bash
# Generate middleware (auto-numbered)
master generate middleware auth

# Creates: middleware/02-auth.js (if 01-logger.js exists)
```

### Create a Component

```bash
# Generate self-contained component
master generate component admin

# Creates component with own routes, controllers, views
```

---

## What's New in v2.0

### Middleware Pipeline System

No more hardcoded request flow! Add custom middleware anywhere in the pipeline:

```javascript
// In config/initializers/config.js

// Simple middleware
master.pipeline.use(async (ctx, next) => {
    console.log(`Incoming: ${ctx.request.url}`);
    await next();
    console.log(`Completed: ${ctx.response.statusCode}`);
});

// Path-specific middleware
master.pipeline.map('/api/*', (api) => {
    api.use(authMiddleware);
    api.use(rateLimitMiddleware);
});

// Auto-discover from middleware/ folder
master.pipeline.discoverMiddleware('middleware');
```

### Route Parameter Casing Fixed

Parameters now preserve casing:

```javascript
// Before v2.0: /users/:userId became /users/:userid ❌
// After v2.0: /users/:userId stays as /users/:userId ✅

router.route('/users/:userId', 'users#show', 'get');

// In controller:
show(obj) {
    const userId = obj.params.userId; // ✅ Correct!
}
```

### Simplified Setup

**Before v2.0:**
```javascript
// Had to manually load tools
master.addInternalTools([
    "MasterError", "MasterRouter", "MasterHtml",
    "MasterTemp", "MasterAction", "MasterActionFilters",
    "MasterSocket", "MasterSession", "MasterRequest",
    "MasterCors", "TemplateOverwrite"
]);
```

**After v2.0:**
```javascript
// Auto-loaded in setupServer() - nothing to do!
var server = master.setupServer("http");
```

### Auto-Discovery

Create middleware files in `middleware/` folder - they're automatically loaded:

```
middleware/
├── 01-logger.js          # Loaded first
├── 02-auth.js            # Loaded second
└── 03-rate-limit.js      # Loaded third
```

### Modern Controller Patterns

```javascript
class UsersController {
    constructor(requestObject) {
        this.requestObject = requestObject;

        // Before/After action filters
        this.beforeAction(["edit", "update", "destroy"], function(obj) {
            if (!isAuthenticated(obj)) {
                obj.response.statusCode = 401;
                obj.response.end('Unauthorized');
                return;
            }
            this.next();
        });
    }

    async index(obj) {
        // Access DI services
        const users = this.db.query('SELECT * FROM users');

        this.render('index', { users });
    }
}
```

---

## CLI Commands

### Application Commands

```bash
# Create new application
master new <name>

# Start server
master server

# Show help
master help
```

### Generator Commands

All generators support the shorthand `g`:

```bash
# Generate controller
master generate controller <Name> [actions...]
master g controller <Name> [actions...]

# Generate views
master generate view <Name> [views...]
master g view <Name> [views...]

# Generate middleware (NEW in v2.0)
master generate middleware <name>
master g middleware <name>

# Generate socket
master generate socket <Name>
master g socket <Name>

# Generate component
master generate component <name>
master g component <name>

# Generate full scaffold (controller + views + routes)
master generate scaffold <Name>
master g scaffold <Name>
```

### Command Examples

```bash
# Controller with RESTful actions
master generate controller Users index show new create edit update destroy

# Views for specific actions
master generate view Users index show new edit

# Middleware (auto-numbered)
master generate middleware auth
# Creates: middleware/02-auth.js

# Socket for realtime features
master generate socket Chat

# Component (self-contained module)
master generate component admin
# Creates: components/admin/ with routes, controllers, views

# Full scaffold
master generate scaffold Posts
# Creates controller, views, and adds routes
```

### CLI Features

- **Colored output** - ✅ Success, ❌ Error, ⚠️ Warning, ℹ️ Info messages
- **Auto-numbering** - Middleware files automatically numbered (01-, 02-, 03-)
- **Directory validation** - Prevents running commands outside project
- **Smart defaults** - Generates modern code patterns
- **Error handling** - Clear error messages with context
- **Next steps** - Shows helpful hints after generation

---

## Project Structure

```
myapp/
├── server.js                          # Entry point
├── config/
│   ├── environments/
│   │   ├── env.development.json      # Dev settings
│   │   ├── env.production.json       # Prod settings
│   │   └── env.test.json             # Test settings
│   ├── initializers/
│   │   ├── config.js                 # Main configuration
│   │   ├── cors.json                 # CORS settings
│   │   ├── mime.json                 # MIME types
│   │   └── request.json              # Request parser settings
│   ├── routes.js                     # Application routes
│   └── load.js                       # Auto-generated route loader
├── middleware/                        # Custom middleware (auto-discovered)
│   ├── 01-logger.js                  # Request logger
│   ├── 02-api-auth.js.example        # API auth (disabled)
│   └── 03-admin-auth.js.example      # Admin auth (disabled)
├── app/
│   ├── controllers/
│   │   └── homeController.js         # Example controller
│   ├── views/
│   │   ├── layouts/
│   │   │   └── master.html           # Main layout
│   │   └── home/
│   │       └── index.html            # Home view
│   ├── sockets/                      # Socket.IO handlers
│   └── assets/
│       ├── javascripts/
│       ├── stylesheets/
│       └── images/
├── components/                        # Self-contained modules
│   └── admin/                        # Example component
│       ├── config/
│       │   └── routes.js
│       ├── app/
│       │   ├── controllers/
│       │   └── views/
│       └── middleware/
├── public/                            # Static files
│   ├── stylesheets/
│   ├── javascripts/
│   └── images/
├── package.json
├── QUICKSTART.md                      # Quick start guide
└── CHANGELOG.md                       # Version history
```

---

## Configuration

### Environment Setup

Set environment when starting:

```bash
# Development (default)
master=development node server.js

# Production
NODE_ENV=production node server.js

# Test
master=test node server.js
```

### Server Configuration

**config/environments/env.development.json:**

```json
{
    "server": {
        "httpPort": 8080,
        "hostname": "localhost",
        "requestTimeout": 120000
    },
    "error": {
        "400": "/public/errors/400.html",
        "401": "/public/errors/401.html",
        "403": "/public/errors/403.html",
        "404": "/public/errors/404.html",
        "405": "/public/errors/405.html",
        "422": "/public/errors/422.html",
        "429": "/public/errors/429.html",
        "500": "/public/errors/500.html",
        "502": "/public/errors/502.html",
        "503": "/public/errors/503.html",
        "504": "/public/errors/504.html"
    }
}
```

### Main Configuration

**config/initializers/config.js:**

```javascript
var master = require('mastercontroller');
var mimes = require('./mime.json');
var request = require('./request.json');
var cors = require('./cors.json');

// 1. MIDDLEWARE REGISTRATION
master.cors.init(cors);
master.sessions.init();

// Timeout system (professional per-request tracking)
master.timeout.init({
    globalTimeout: 120000,  // 120 seconds default
    enabled: true
});
master.pipeline.use(master.timeout.middleware());

// Route-specific timeouts (optional)
// master.timeout.setRouteTimeout('/api/*', 30000);          // 30s for APIs
// master.timeout.setRouteTimeout('/admin/reports', 300000); // 5min for reports

// Error renderer (Rails/Django style error pages)
master.errorRenderer.init({
    templateDir: 'app/views/errors',
    environment: master.environmentType,
    showStackTrace: master.environmentType === 'development'
});

// Auto-discover custom middleware
master.pipeline.discoverMiddleware('middleware');

// 2. FRAMEWORK CONFIGURATION
master.request.init(request);
master.error.init(master.env.error);
master.router.addMimeList(mimes);
master.socket.init();

// 3. SERVER SETTINGS
master.serverSettings(master.env.server);

// 4. DEPENDENCY INJECTION
master.addSingleton('db', DatabaseConnection);
master.addScoped('logger', RequestLogger);
master.addTransient('email', EmailService);

// 5. ROUTES & COMPONENTS
master.startMVC("config");
master.component("components", "admin");
```

### CORS Configuration

**config/initializers/cors.json:**

```json
{
    "origin": true,
    "credentials": true,
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
    "allowedHeaders": ["Content-Type", "Authorization"],
    "exposedHeaders": ["X-Total-Count"],
    "maxAge": 86400
}
```

### Request Parser Configuration

**config/initializers/request.json:**

```json
{
    "limits": {
        "fileSize": 10485760,
        "files": 10
    },
    "uploadDir": "./uploads",
    "keepExtensions": true
}
```

---

## Middleware System

### Overview

Master v2.0 introduces an ASP.NET Core-style middleware pipeline with Use/Run/Map patterns.

### Middleware Patterns

#### Use - Pass-Through Middleware

```javascript
master.pipeline.use(async (ctx, next) => {
    // Before request
    console.log(`→ ${ctx.type.toUpperCase()} ${ctx.request.url}`);

    await next(); // Continue pipeline

    // After response
    console.log(`← ${ctx.response.statusCode}`);
});
```

#### Run - Terminal Middleware

```javascript
master.pipeline.run(async (ctx) => {
    // No next() - terminates pipeline
    ctx.response.end('Handled by terminal middleware');
});
```

#### Map - Conditional Middleware

```javascript
master.pipeline.map('/api/*', (api) => {
    api.use(async (ctx, next) => {
        // Only runs for /api/* routes
        const token = ctx.request.headers['authorization'];
        if (!token) {
            ctx.response.statusCode = 401;
            ctx.response.end('Unauthorized');
            return;
        }
        ctx.state.user = await validateToken(token);
        await next();
    });
});
```

#### Error Handling Middleware

```javascript
master.pipeline.useError(async (error, ctx, next) => {
    console.error('Pipeline error:', error);

    if (!ctx.response.headersSent) {
        ctx.response.statusCode = 500;
        ctx.response.end('Internal Server Error');
    }
});
```

### Auto-Discovery

Create middleware files in `middleware/` folder:

**middleware/01-logger.js:**

```javascript
// Simple function export
module.exports = async (ctx, next) => {
    const start = Date.now();
    console.log(`→ ${ctx.type.toUpperCase()} ${ctx.request.url}`);

    await next();

    const duration = Date.now() - start;
    console.log(`← ${ctx.response.statusCode} (${duration}ms)`);
};
```

**middleware/02-api-auth.js:**

```javascript
// Advanced pattern with register()
module.exports = {
    register: (master) => {
        master.pipeline.map('/api/*', (api) => {
            api.use(async (ctx, next) => {
                const token = ctx.request.headers['authorization'];
                if (!token) {
                    ctx.response.statusCode = 401;
                    ctx.response.end('Unauthorized');
                    return;
                }
                ctx.state.user = await validateToken(token);
                await next();
            });
        });
    }
};
```

Then enable auto-discovery in config:

```javascript
master.pipeline.discoverMiddleware('middleware');
```

Files are loaded alphabetically (use 01-, 02- prefixes for ordering).

### Context Object

Every middleware receives a context object:

```javascript
{
    request: req,          // Node.js request
    response: res,         // Node.js response
    requrl: parsedUrl,     // Parsed URL object
    pathName: 'users/123', // Normalized path
    type: 'get',           // HTTP method (lowercase)
    params: {},            // Route params, query, formData
    state: {},             // User-defined state
    master: master,        // Framework instance
    isStatic: false        // Is static file request?
}
```

### Security Middleware

```javascript
const { pipelineSecurityHeaders, pipelineRateLimit, pipelineCSRF } =
    require('mastercontroller/security/SecurityMiddleware');

// Security headers
master.pipeline.use(pipelineSecurityHeaders());

// Rate limiting
master.pipeline.use(pipelineRateLimit({
    rateLimitMax: 100,
    rateLimitWindow: 60000
}));

// CSRF protection
master.pipeline.use(pipelineCSRF());
```

---

## Routing

### Basic Routes

**config/routes.js:**

```javascript
var master = require('mastercontroller');
var router = master.router.start();

// Basic route
router.route("/", "home#index", "get");

// Route with parameters (casing preserved!)
router.route("/users/:userId", "users#show", "get");
router.route("/posts/:postId/comments/:commentId", "comments#show", "get");

// Multiple HTTP methods
router.route("/api/users", "api/users#index", "get");
router.route("/api/users", "api/users#create", "post");
```

### RESTful Resources

```javascript
// Generates 7 routes automatically:
// GET    /posts          -> posts#index
// GET    /posts/new      -> posts#new
// POST   /posts          -> posts#create
// GET    /posts/:id      -> posts#show
// GET    /posts/:id/edit -> posts#edit
// PUT    /posts/:id      -> posts#update
// DELETE /posts/:id      -> posts#destroy
router.resources("posts");
```

### Route Constraints

```javascript
router.route("/admin", "admin#index", "get", function(obj) {
    // Check authentication
    if (!isAuthenticated(obj)) {
        obj.response.statusCode = 401;
        obj.response.end('Unauthorized');
        return;
    }
    // Continue to controller
    this.next();
});
```

### Accessing Route Parameters

```javascript
class UsersController {
    show(obj) {
        // Route parameters (casing preserved!)
        const userId = obj.params.userId;

        // Query string parameters
        const page = obj.params.query.page;
        const search = obj.params.query.search;

        // Form data
        const email = obj.params.formData.email;

        // Files
        const avatar = obj.params.formData.files.avatar;

        // HTTP method
        const method = obj.type; // 'get', 'post', 'put', 'delete'
    }
}
```

---

## Controllers

### Basic Controller

```javascript
const master = require('mastercontroller');

class UsersController {
    constructor(requestObject) {
        this.requestObject = requestObject;
    }

    async index(obj) {
        const users = await this.db.query('SELECT * FROM users');

        this.render('index', {
            title: 'Users',
            users: users
        });
    }

    async show(obj) {
        const userId = obj.params.userId;
        const user = await this.db.query('SELECT * FROM users WHERE id = ?', [userId]);

        this.render('show', { user });
    }

    async create(obj) {
        const formData = obj.params.formData;
        await this.db.query('INSERT INTO users SET ?', formData);

        this.redirect('/users');
    }

    async api(obj) {
        this.json({
            success: true,
            data: { message: 'API response' }
        });
    }
}

module.exports = UsersController;
```

### Before/After Action Filters

```javascript
class UsersController {
    constructor(requestObject) {
        this.requestObject = requestObject;

        // Run before specific actions
        this.beforeAction(["edit", "update", "destroy"], function(obj) {
            if (!isAuthenticated(obj)) {
                obj.response.statusCode = 401;
                obj.response.end('Unauthorized');
                return;
            }
            this.next();
        });

        // Run after specific actions
        this.afterAction(["create", "update"], function(obj) {
            console.log('User data modified');
        });
    }
}
```

### Controller Methods

#### Rendering

```javascript
// Render view with layout
this.render('viewName', { data });

// Render component view
this.renderComponent('componentName', 'viewName', { data });

// Send JSON
this.json({ data });

// Redirect
this.redirect('/path');
```

#### Accessing Services (DI)

```javascript
class UsersController {
    async index(obj) {
        // Singleton (one instance for app)
        const users = this.db.query('SELECT * FROM users');

        // Scoped (one instance per request)
        this.logger.log('Fetched users');

        // Transient (new instance per access)
        this.email.send(user.email, 'Subject', 'Body');
    }
}
```

---

## Dependency Injection

### Registering Services

**config/initializers/config.js:**

```javascript
// Singleton - One instance for entire app lifetime
master.addSingleton('db', DatabaseConnection);

// Scoped - One instance per request
master.addScoped('logger', RequestLogger);

// Transient - New instance every time accessed
master.addTransient('email', EmailService);
```

### Using Services in Controllers

```javascript
class UsersController {
    async index(obj) {
        // Access via this.<serviceName>
        const users = this.db.query('SELECT * FROM users');
        this.logger.log('Fetched users');
        this.email.send(user.email, 'Welcome', 'Welcome to our app!');
    }
}
```

### Service Example

```javascript
// services/DatabaseConnection.js
class DatabaseConnection {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'myapp'
        });
    }

    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
}

module.exports = DatabaseConnection;
```

---

## Components

Components are self-contained modules with their own routes, controllers, views, and middleware.

### Creating a Component

```bash
master generate component admin
```

Creates:

```
components/admin/
├── config/
│   ├── routes.js
│   └── initializers/
│       └── config.js
├── app/
│   ├── controllers/
│   │   └── homeController.js
│   └── views/
│       └── home/
│           └── index.html
└── middleware/
```

### Loading Components

**config/initializers/config.js:**

```javascript
// Load component
master.component("components", "admin");
```

### Component Routes

**components/admin/config/routes.js:**

```javascript
var master = require('mastercontroller');
var router = master.router.start();

// Component routes are automatically namespaced
router.route("/", "home#index", "get");
router.route("/users", "users#index", "get");
```

Routes become: `/admin/`, `/admin/users`

---

## Development Workflow

### Starting the Server

```bash
# Development mode (default)
master server

# Or explicitly
master=development node server.js

# Production mode
NODE_ENV=production node server.js
```

### Common Development Tasks

```bash
# 1. Create new feature
master generate controller Posts index show new create edit update destroy
master generate view Posts index show new edit

# 2. Add custom middleware
master generate middleware auth

# 3. Edit routes
# Edit config/routes.js to add:
router.resources("posts");

# 4. Restart server
# Stop (Ctrl+C) and restart
master server
```

### File Watching

Master doesn't include automatic file watching by default. Use nodemon for development:

```bash
npm install -g nodemon

# Add to package.json scripts:
{
  "scripts": {
    "dev": "nodemon server.js"
  }
}

# Run with:
npm run dev
```

---

## Cross-Platform Notes

The CLI uses Node's `path.join` and `fs-extra` to work consistently across macOS, Windows, and Linux.

**Path separators:**
- Use `path.join()` for cross-platform paths
- CLI generates proper paths for your OS

**Line endings:**
- CLI respects OS line endings (LF on Unix, CRLF on Windows)

**File permissions:**
- Executable: Generated files have appropriate permissions

**Running commands:**
- Always run CLI commands from your app root directory
- CLI validates you're in a Master project before running generators

---

## Documentation

### Generated Documentation

Every new project includes:

- **QUICKSTART.md** - Step-by-step quick start guide
- **CHANGELOG.md** - Version history and migration guide
- **middleware/README.md** - Middleware patterns and examples

### Framework Documentation

- **Master CLI** - This file (README.md)
- **MasterController** - Framework API reference
- **MasterRecord** - Data access layer documentation

### Getting Help

```bash
# Show CLI help
master help

# Command-specific help
master generate --help
```

---

## Examples

### Example 1: Blog Application

```bash
# Create app
master new blog
cd blog

# Generate posts
master generate scaffold Posts
# Creates controller, views, and routes

# Generate comments
master generate controller Comments create destroy
master generate view Comments _form

# Add middleware
master generate middleware auth

# Edit routes (config/routes.js)
router.resources("posts");
router.route("/posts/:postId/comments", "comments#create", "post");

# Start server
master server
```

### Example 2: API with Authentication

```bash
# Create app
master new api-app
cd api-app

# Generate API controllers
master generate controller api/Users index show create update destroy
master generate controller api/Auth login logout

# Add auth middleware
master generate middleware api-auth

# Edit middleware/02-api-auth.js
# (see middleware examples above)

# Edit routes
router.route("/api/auth/login", "api/auth#login", "post");
router.route("/api/users", "api/users#index", "get");
router.route("/api/users", "api/users#create", "post");

# Start server
master server
```

### Example 3: Multi-Component Application

```bash
# Create app
master new enterprise-app
cd enterprise-app

# Generate components
master generate component admin
master generate component api
master generate component public

# Load in config/initializers/config.js
master.component("components", "admin");
master.component("components", "api");
master.component("components", "public");

# Each component has own routes, controllers, views
# admin -> /admin/*
# api -> /api/*
# public -> /public/*
```

---

## Upgrading from v1.x

### Migration Steps

**Step 1:** Update server.js

```javascript
// Before
master.addInternalTools([...]);

// After
// Remove this line - tools are auto-loaded!
```

**Step 2:** Update config/initializers/config.js

```javascript
// Add middleware discovery (optional)
master.pipeline.discoverMiddleware('middleware');
```

**Step 3:** Create middleware/ directory (optional)

```bash
mkdir middleware
master generate middleware logger
```

**Step 4:** Update route parameter access (if needed)

```javascript
// Before
const periodid = obj.params.periodid; // lowercase

// After
const periodId = obj.params.periodId; // camelCase preserved!
```

**That's it!** Everything else continues to work.

### Breaking Changes

**None!** All changes are backwards compatible.

---

## Troubleshooting

### Common Issues

**1. "Command not found: master"**

```bash
# Reinstall globally
npm install -g master

# Or use npx
npx master new myapp
```

**2. "Please run this command from inside a Master project directory"**

```bash
# You're not in a Master project
cd your-master-app

# Then run command
master generate controller Users
```

**3. "Port already in use"**

```bash
# Change port in config/environments/env.development.json
{
  "server": {
    "httpPort": 3000  # Change to different port
  }
}
```

**4. Middleware not loading**

```bash
# Check middleware file naming
middleware/01-logger.js  # ✅ Correct
middleware/logger.js     # ✅ Also works

# Check export pattern
module.exports = async (ctx, next) => { ... }  # ✅ Function export
module.exports = { register: (master) => { ... } }  # ✅ Register pattern
```

---

## Contributing

Contributions welcome! Please:

1. Keep generators idempotent
2. Document new features
3. Follow existing code style
4. Add tests for new features
5. Update documentation

### Development Setup

```bash
git clone https://github.com/alexanderrich/master.git
cd master
npm install
npm link  # Make local CLI available globally
```

### Running Tests

```bash
npm test
```

---

## License

MIT License

Copyright (c) Alexander Rich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

See [LICENSE](./LICENSE) for details.

---

## Links

- **GitHub Repository**: https://github.com/alexanderrich/master
- **MasterController**: https://github.com/alexanderrich/mastercontroller
- **MasterRecord**: https://github.com/alexanderrich/masterrecord
- **Issues**: https://github.com/alexanderrich/master/issues
- **Documentation**: See QUICKSTART.md and CHANGELOG.md in generated projects

---

**Built with ❤️ by Alexander Rich**
