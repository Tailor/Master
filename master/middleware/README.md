# Middleware Directory

This directory contains custom middleware that is auto-discovered and loaded by MasterController.

## How It Works

Files in this directory are automatically loaded when the server starts, in **alphabetical order**.

Use number prefixes to control execution order:
- `01-logger.js` - Runs first
- `02-api-auth.js` - Runs second
- `03-admin-auth.js` - Runs third

## Middleware Patterns

### Pattern 1: Simple Function Export

Export an async function that receives `(ctx, next)`:

```javascript
// middleware/01-logger.js
module.exports = async (ctx, next) => {
    console.log(`→ ${ctx.type.toUpperCase()} ${ctx.request.url}`);
    await next(); // Continue to next middleware
    console.log(`← ${ctx.response.statusCode}`);
};
```

### Pattern 2: Register Function

Export an object with a `register()` method for complex middleware:

```javascript
// middleware/02-api-auth.js
module.exports = {
    register: (master) => {
        // Apply middleware only to specific routes
        master.pipeline.map('/api/*', (api) => {
            api.use(async (ctx, next) => {
                // Your middleware logic here
                await next();
            });
        });
    }
};
```

## Context Object

Middleware receives a context object with:

```javascript
{
    request: req,           // Node.js request object
    response: res,          // Node.js response object
    requrl: parsedUrl,      // Parsed URL with query
    pathName: 'api/users',  // Normalized path (lowercase)
    type: 'get',            // HTTP method (lowercase)
    params: {               // Route parameters + query + form data
        query: {},          // Query string parameters
        formData: {},       // POST body data
        userId: '123'       // Route parameters (casing preserved!)
    },
    state: {},              // Custom state to share between middleware
    master: master,         // Framework instance
    isStatic: false         // Is this a static file request?
}
```

## Middleware Methods

### Pass-through Middleware

Calls `next()` to continue the pipeline:

```javascript
master.pipeline.use(async (ctx, next) => {
    // Before
    await next();
    // After
});
```

### Terminal Middleware

Does NOT call `next()`, ends the pipeline:

```javascript
master.pipeline.run(async (ctx) => {
    ctx.response.end('Done');
});
```

### Conditional Middleware

Only runs for matching paths:

```javascript
master.pipeline.map('/api/*', (api) => {
    api.use(async (ctx, next) => {
        // Only runs for /api/* routes
        await next();
    });
});
```

### Short-circuiting

Don't call `next()` to stop the pipeline:

```javascript
module.exports = async (ctx, next) => {
    if (!isAuthenticated(ctx)) {
        ctx.response.statusCode = 401;
        ctx.response.end('Unauthorized');
        return; // Don't call next()
    }
    await next(); // Continue
};
```

## Examples

See the `.example` files in this directory for complete examples:
- `02-api-auth.js.example` - API token authentication
- `03-admin-auth.js.example` - Admin route protection

To enable an example, remove the `.example` extension.

## Common Use Cases

### Request Timing
```javascript
module.exports = async (ctx, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    console.log(`Request took ${duration}ms`);
};
```

### CORS Headers
```javascript
module.exports = async (ctx, next) => {
    ctx.response.setHeader('Access-Control-Allow-Origin', '*');
    await next();
};
```

### Authentication Check
```javascript
module.exports = async (ctx, next) => {
    const session = master.sessions.get('user', ctx.request);
    if (!session) {
        ctx.response.statusCode = 302;
        ctx.response.setHeader('Location', '/login');
        ctx.response.end();
        return;
    }
    ctx.state.user = session;
    await next();
};
```

### Response Compression
```javascript
const zlib = require('zlib');

module.exports = async (ctx, next) => {
    await next();

    if (ctx.response.statusCode === 200) {
        // Compress response (simplified example)
        const acceptEncoding = ctx.request.headers['accept-encoding'] || '';
        if (acceptEncoding.includes('gzip')) {
            ctx.response.setHeader('Content-Encoding', 'gzip');
        }
    }
};
```

## Disabled by Default

Middleware files with `.example` extension are NOT loaded. To enable:

```bash
mv 02-api-auth.js.example 02-api-auth.js
```

## Documentation

For more information, see:
- [README.md](../README.md) - Complete API documentation
- [MasterController Middleware Guide](https://github.com/alexanderrich/mastercontroller)
