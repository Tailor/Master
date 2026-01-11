var master = require('mastercontroller');

var router = master.router.start();

// ===========================
// BASIC ROUTES
// ===========================

// Root route
router.route("/", "home#index", "get");

// ===========================
// ROUTES WITH PARAMETERS
// ===========================

// Parameter casing is preserved!
// Example: router.route("/users/:userId", "users#show", "get");
// In controller: obj.params.userId (not userid)

// Example with multiple parameters
// router.route("/period/:periodId/items/:itemId", "period#show", "get");

// ===========================
// RESTFUL RESOURCES
// ===========================

// Generate 7 RESTful routes automatically:
// GET    /users           -> users#index
// GET    /users/new       -> users#new
// POST   /users           -> users#create
// GET    /users/:id       -> users#show
// GET    /users/:id/edit  -> users#edit
// PUT    /users/:id       -> users#update
// DELETE /users/:id       -> users#destroy

// Example: router.resources("users");

// ===========================
// ROUTE CONSTRAINTS
// ===========================

// Add custom logic to routes with constraints
// Example:
// router.route("/admin", "admin#index", "get", function(requestObject) {
//     // Check authentication
//     if (!isAuthenticated(requestObject)) {
//         requestObject.response.statusCode = 401;
//         requestObject.response.end('Unauthorized');
//         return;
//     }
//     // Continue to controller
//     this.next();
// });

// ===========================
// API ROUTES
// ===========================

// Example API routes
// router.route("/api/users", "api/users#index", "get");
// router.route("/api/users/:userId", "api/users#show", "get");
// router.route("/api/users", "api/users#create", "post");
