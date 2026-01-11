# MasterController Quickstart Guide

This guide will help you get started with MasterController and its new middleware pipeline system.

## Installation

```bash
npm install mastercontroller
```

## Project Structure

```
your-project/
├── server.js                      # Entry point
├── config/
│   ├── initializers/
│   │   ├── config.js             # Main configuration
│   │   ├── cors.json             # CORS settings
│   │   ├── mime.json             # MIME types
│   │   └── request.json          # Request parser settings
│   ├── routes.js                  # Application routes
│   └── load.js                    # Route loader (auto-generated)
├── middleware/                    # Custom middleware (auto-discovered)
│   ├── 01-logger.js              # Request logger
│   ├── 02-api-auth.js.example    # API authentication (disabled)
│   └── 03-admin-auth.js.example  # Admin authentication (disabled)
├── app/
│   ├── controllers/
│   │   └── homeController.js     # Example controller
│   ├── views/
│   │   ├── layouts/
│   │   │   └── master.html       # Main layout
│   │   └── home/
│   │       └── index.html        # Home view
│   └── assets/
│       ├── javascripts/
│       ├── stylesheets/
│       └── images/
└── package.json
```

## Step 1: Server Setup (server.js)

```javascript
var master = require('mastercontroller');

// Environment setup
master.environmentType = process.env.master || process.env.NODE_ENV || 'development';
master.root = __dirname;

// Setup server (internal tools are auto-loaded)
var server = master.setupServer("http");

// Load configuration
require("./config/initializers/config");

master.start(server);
```

**Note:** `addInternalTools()` is no longer needed - tools are auto-loaded!

## Step 2: Configuration (config/initializers/config.js)

```javascript
var master = require('mastercontroller');
var mimes = require('./mime.json');
var request = require('./request.json');
var cors = require('./cors.json');

// 1. MIDDLEWARE REGISTRATION (New!)
master.cors.init(cors);              // Auto-registers with pipeline
master.sessions.init();              // Auto-registers with pipeline
master.pipeline.discoverMiddleware('middleware'); // Auto-discover custom middleware

// 2. FRAMEWORK CONFIGURATION
master.request.init(request);
master.error.init(master.env.error);
master.router.addMimeList(mimes);
master.socket.init();

// 3. SERVER SETTINGS
master.serverSettings(master.env.server);

// 4. DEPENDENCY INJECTION (Optional)
// master.addSingleton('db', DatabaseConnection);
// master.addScoped('logger', RequestLogger);
// master.addTransient('email', EmailService);

// 5. LOAD ROUTES
master.startMVC("config");
```

## Step 3: Routes (config/routes.js)

```javascript
var master = require('mastercontroller');
var router = master.router.start();

// Basic route
router.route("/", "home#index", "get");

// Route with parameters (casing preserved!)
router.route("/users/:userId", "users#show", "get");

// RESTful resources (generates 7 routes)
router.resources("posts");

// Route with constraint
router.route("/admin", "admin#index", "get", function(obj) {
    if (!isAuthenticated(obj)) {
        obj.response.statusCode = 401;
        obj.response.end('Unauthorized');
        return;
    }
    this.next();
});
```

## Step 4: Controller (app/controllers/homeController.js)

```javascript
const master = require('mastercontroller');

class homeController {
    constructor(requestObject) {
        this.requestObject = requestObject;

        // Before/After action filters
        this.beforeAction(["edit", "update"], function(obj) {
            if (!isAuthenticated(obj)) {
                obj.response.statusCode = 401;
                obj.response.end('Unauthorized');
                return;
            }
            this.next();
        });
    }

    index(obj) {
        // Access route parameters (casing preserved!)
        const userId = obj.params.userId;

        // Access query string
        const search = obj.params.query.search;

        // Access form data
        const email = obj.params.formData.email;

        // Access DI services
        // const users = this.db.query('SELECT * FROM users');

        // Render view
        this.render('index', {
            title: 'Home',
            users: []
        });
    }

    show(obj) {
        const id = obj.params.id;
        this.render('show', { id });
    }

    create(obj) {
        const data = obj.params.formData;
        // Save data...
        this.redirect('/home');
    }

    api(obj) {
        this.json({
            success: true,
            data: { message: 'API response' }
        });
    }
}

module.exports = homeController;
```

## Step 5: Custom Middleware (Optional)

### Simple Middleware (middleware/01-logger.js)

```javascript
module.exports = async (ctx, next) => {
    const start = Date.now();
    console.log(`→ ${ctx.type.toUpperCase()} ${ctx.request.url}`);

    await next();

    const duration = Date.now() - start;
    console.log(`← ${ctx.response.statusCode} (${duration}ms)`);
};
```

### Advanced Middleware (middleware/02-api-auth.js)

```javascript
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

## Step 6: Views

### Layout (app/views/layouts/master.html)

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
</head>
<body>
    <header>
        <h1>My App</h1>
    </header>
    <main>
        {{body}}
    </main>
    <footer>
        &copy; 2025
    </footer>
</body>
</html>
```

### View (app/views/home/index.html)

```html
<h2>{{title}}</h2>
<ul>
{{#each users}}
    <li>{{this.name}}</li>
{{/each}}
</ul>
```

## Step 7: Run the Server

```bash
# Development
master=development node server.js

# Production
NODE_ENV=production node server.js
```

## New Features

### 1. Middleware Pipeline

No more hardcoded request flow! Add custom middleware:

```javascript
// In config/initializers/config.js
master.pipeline.use(async (ctx, next) => {
    // Before request
    await next();
    // After response
});

master.pipeline.map('/admin/*', (admin) => {
    admin.use(authMiddleware);
});
```

### 2. Parameter Casing Preserved

Route parameters now preserve casing:

```javascript
router.route("/period/:periodId", "period#show", "get");

// In controller:
show(obj) {
    const periodId = obj.params.periodId; // ✅ Not periodid!
}
```

### 3. Auto-Discovery

Middleware in `middleware/` folder is auto-loaded alphabetically:

```
middleware/
├── 01-logger.js          # Runs first
├── 02-api-auth.js       # Runs second
└── 03-admin-auth.js     # Runs third
```

### 4. Simplified Setup

No more `addInternalTools()` - everything is auto-loaded!

**Before:**
```javascript
master.addInternalTools(["MasterError", "MasterRouter", ...]);
```

**After:**
```javascript
var server = master.setupServer("http"); // Tools auto-loaded!
```

## Security Features

### CORS

```javascript
master.cors.init({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});
```

### Sessions

```javascript
master.sessions.init({
    secret: 'your-secret-key',
    maxAge: 900000,
    httpOnly: true,
    secure: true
});

// In controller:
master.sessions.set('user', userData, obj.response);
const user = master.sessions.get('user', obj.request);
```

### Security Headers

```javascript
const { pipelineSecurityHeaders, pipelineRateLimit } =
    require('mastercontroller/security/SecurityMiddleware');

master.pipeline.use(pipelineSecurityHeaders());
master.pipeline.use(pipelineRateLimit({ rateLimitMax: 100 }));
```

## Dependency Injection

```javascript
// Singleton (one instance for app)
master.addSingleton('db', DatabaseConnection);

// Scoped (one instance per request)
master.addScoped('logger', RequestLogger);

// Transient (new instance per access)
master.addTransient('email', EmailService);

// Use in controllers:
class UsersController {
    index(obj) {
        const users = this.db.query('SELECT * FROM users');
        this.logger.log('Fetched users');
        this.email.send(user.email, 'Subject', 'Body');
    }
}
```

## Components

Self-contained modules:

```javascript
// In config/initializers/config.js
master.component('components', 'auth');
master.component('components', 'mail');
```

Components have their own routes, controllers, views, and services.

## Next Steps

1. **Read the README.md** - Complete API documentation
2. **Check middleware/README.md** - Middleware patterns and examples
3. **Explore examples** - See `.example` files in middleware/
4. **Add security** - Enable rate limiting, CSRF, security headers
5. **Add DI services** - Register your database, logger, email service

## Common Commands

```bash
# Generate controller
master generate controller Users

# Generate component
master generate component auth

# Start development server
master=development node server.js

# Start production server
NODE_ENV=production node server.js
```

## Help & Support

- **Documentation:** [README.md](README.md)
- **Middleware Guide:** [middleware/README.md](middleware/README.md)
- **GitHub:** https://github.com/alexanderrich/mastercontroller
- **Issues:** https://github.com/alexanderrich/mastercontroller/issues

---

**Welcome to MasterController!** 🚀
