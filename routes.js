
var app = require('mastercontroller');
var router = require('masterrouter');
// setup routes

router.route("/", "pages/home", "get");

// setup route resources
// router.routeResources("add your resource name here");

