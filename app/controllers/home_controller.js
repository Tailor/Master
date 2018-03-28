
var app = require('mastercontroller');


app.controller({
	action : "index",
	type: "get"
}, function(obj){

	app.view.returnView();

});
