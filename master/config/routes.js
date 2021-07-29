
var master = require('mastercontroller');

var router = master.router.start();
//an example of using a slug
//router.route("/controller/action:slug", "controller#action", "get");

router.route("/", "home#index", "get");