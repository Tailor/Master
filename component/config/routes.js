
var master = require('mastercontroller')
var router = master.router.start(); // should get location from calling function

router.route("/REPLACEWITHFOLDERNAME", "home#index", "get");
// Only route users from your component
//an example of using a slug
//router.route("/controller/action/:slug", "/controller/action", "get");