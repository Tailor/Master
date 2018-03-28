
var app = require('mastercontroller');

module.exports = function(req, res) { 

	//  setup my module apps that load
	app.view.load(req, res, __dirname);
	app.api.load(req, res);
	app.error.load(req, res, __dirname);
	app.sessions.load(req, res);
	// master router must be set to last
	app.router.load(req, res, __dirname);
	
	app.view.html.addFolderJS();
	app.view.html.addFolderStyles();

}