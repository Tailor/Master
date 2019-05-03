
var router = require('mastercontroller').router;
//an example of using a slug
//router.route("/controller/action/:slug", "/controller/action", "get");

router.route("/", "pages/home", "get");