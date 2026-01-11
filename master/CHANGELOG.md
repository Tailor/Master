# Changelog - MasterController Template Updates

## [2.0.0] - 2025-01-11

### 🚀 Major Features

#### Middleware Pipeline System
- **NEW:** ASP.NET Core-style middleware pipeline
- **NEW:** `master.pipeline.use()` - Add pass-through middleware
- **NEW:** `master.pipeline.run()` - Add terminal middleware
- **NEW:** `master.pipeline.map()` - Conditional path-based middleware
- **NEW:** `master.pipeline.useError()` - Error handling middleware
- **NEW:** `master.pipeline.discoverMiddleware()` - Auto-discover middleware from folders

#### Auto-Discovery
- **NEW:** Middleware files in `middleware/` directory are automatically loaded
- **NEW:** Alphabetical loading order (use `01-`, `02-` prefixes)
- **NEW:** Two patterns supported: function export or `{ register: (master) => {} }`

#### Simplified Setup
- **REMOVED:** `master.addInternalTools()` - no longer needed!
- **IMPROVED:** Internal tools are now auto-loaded in `setupServer()`
- **IMPROVED:** Cleaner, simpler server.js

### 🐛 Bug Fixes

#### Route Parameter Casing
- **FIXED:** Route parameters now preserve casing
- **BEFORE:** `/period/:periodId` became `:periodid` (all lowercase)
- **AFTER:** `/period/:periodId` stays as `:periodId` (camelCase preserved)
- **IMPACT:** No more `obj.params.periodid` - now correctly `obj.params.periodId`

### 📝 Template Updates

#### server.js
- Removed `master.addInternalTools()` call
- Simplified to 3-line setup
- Better comments and examples
- Auto-loads internal tools

#### config/initializers/config.js
- **NEW:** Middleware registration section
- **NEW:** `master.pipeline.discoverMiddleware()` call
- **IMPROVED:** Organized into 5 clear sections
- **IMPROVED:** Better comments for DI examples
- **NEW:** Optional security middleware examples

#### config/routes.js
- **NEW:** Examples showing parameter casing preservation
- **NEW:** RESTful resources documentation
- **NEW:** Route constraints examples
- **NEW:** API route examples
- **IMPROVED:** Better organization with sections

#### app/controllers/homeController.js
- **NEW:** Constructor now receives `requestObject` parameter
- **NEW:** Before/After action filter examples
- **NEW:** Complete request data access examples
- **NEW:** DI service access examples
- **NEW:** Multiple action examples (show, create, api)
- **IMPROVED:** Modern async/await patterns

#### middleware/ Directory (NEW)
- **NEW:** `01-logger.js` - Request logging example
- **NEW:** `02-api-auth.js.example` - API authentication example
- **NEW:** `03-admin-auth.js.example` - Admin protection example
- **NEW:** `README.md` - Complete middleware documentation

### 📚 Documentation

#### QUICKSTART.md (NEW)
- Complete quickstart guide
- Step-by-step setup instructions
- Examples for all major features
- Common patterns and use cases

#### CHANGELOG.md (NEW)
- This file - documents all changes

#### README.md Updates
- **NEW:** Complete middleware pipeline documentation
- **NEW:** View pattern hooks section (`master.extendView()`)
- **NEW:** Routing API with parameter casing examples
- **NEW:** Controller API with all methods
- **NEW:** DI lifetimes (Singleton, Scoped, Transient)
- **NEW:** Security features documentation
- **NEW:** Components documentation
- **NEW:** Complete API reference section

### 🔒 Security

#### Auto-Registration
- CORS now auto-registers with pipeline when `init()` is called
- Sessions now auto-register with pipeline when `init()` is called
- Security middleware can be easily added to pipeline

#### Pipeline Integration
- Security headers middleware available
- Rate limiting middleware available
- CSRF protection middleware available
- All security features work with new pipeline

### 🔄 Breaking Changes

**None!** All changes are backwards compatible.

- Existing code using old patterns continues to work
- `master.addInternalTools()` is optional (but not needed)
- All existing APIs remain functional

### ⚡ Performance

- **IMPROVED:** Middleware execution is async/await based
- **IMPROVED:** Request/response flow more efficient
- **IMPROVED:** Error handling more robust

### 🎯 Migration Guide

#### From v1.x to v2.0

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
# Add custom middleware files
```

**Step 4:** Update route parameter access (if needed)
```javascript
// Before
const periodid = obj.params.periodid; // lowercase

// After
const periodId = obj.params.periodId; // camelCase preserved!
```

**That's it!** Everything else continues to work.

### 📦 Component Templates

#### component/config/initializers/config.js
- **IMPROVED:** Updated with component-specific patterns
- **NEW:** Middleware registration examples
- **NEW:** DI registration examples

#### component/config/routes.js
- **IMPROVED:** Better examples and documentation
- **NEW:** Parameter casing examples

#### component/app/controllers/homeController.js
- **IMPROVED:** Modern patterns
- **NEW:** Constructor with requestObject
- **NEW:** DI access examples

### 🛠️ Templates

#### templates/controller.js
- **COMPLETE REWRITE:** Modern RESTful controller template
- **NEW:** Before/After action filters
- **NEW:** All 7 RESTful actions with examples
- **NEW:** Request data access documentation
- **NEW:** DI service access documentation
- **NEW:** Comprehensive inline documentation

### 🎨 Examples

All example files now include:
- Inline documentation
- Use case explanations
- Parameter casing examples
- DI usage examples
- Error handling patterns

### 🔗 Integration

The new middleware system integrates seamlessly with:
- ✅ CORS (auto-registers)
- ✅ Sessions (auto-registers)
- ✅ Security middleware (manual registration)
- ✅ Static file serving (automatic)
- ✅ Body parsing (automatic)
- ✅ Routing (automatic)
- ✅ Error handling (automatic)

### 📋 Files Changed

**Modified:**
- `master/server.js`
- `master/config/initializers/config.js`
- `master/config/routes.js`
- `master/app/controllers/homeController.js`
- `component/config/initializers/config.js`
- `component/config/routes.js`
- `component/app/controllers/homeController.js`
- `templates/controller.js`

**Created:**
- `master/middleware/` directory
- `master/middleware/01-logger.js`
- `master/middleware/02-api-auth.js.example`
- `master/middleware/03-admin-auth.js.example`
- `master/middleware/README.md`
- `master/QUICKSTART.md`
- `master/CHANGELOG.md`

### 🙏 Credits

- Inspired by ASP.NET Core middleware pipeline
- Follows Express.js middleware patterns
- Preserves MasterController simplicity

### 📞 Support

For questions or issues with the new templates:
- GitHub Issues: https://github.com/alexanderrich/mastercontroller/issues
- Documentation: README.md, QUICKSTART.md, middleware/README.md

---

**Thank you for using MasterController!** 🚀
