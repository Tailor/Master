var master = require('mastercontroller');
var router = master.router.start();

// ===========================
// COMPONENT ROUTES
// ===========================

// Component routes are scoped to the component namespace
// Replace COMPONENTNAME with your component's name

router.route("/COMPONENTNAME", "home#index", "get");

// ===========================
// EXAMPLE ROUTES
// ===========================

// Parameter casing is preserved!
// router.route("/COMPONENTNAME/:itemId", "items#show", "get");

// Multiple parameters
// router.route("/COMPONENTNAME/:categoryId/items/:itemId", "items#show", "get");

// ===========================
// RESTFUL RESOURCES
// ===========================

// Generate 7 RESTful routes
// router.resources("items");
