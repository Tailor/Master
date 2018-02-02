
var app = require('mastercontroller');
var appView = require('masterview');
var appAPI = require('masterapi');


app.controller({
	namespace : "pages",
	action : "home",
	type: "get"
}, function(obj){

	//appAPI.returnAPI({ status: "ok"});

	appView.returnView({
		no_header : true
	});

});

app.controller({
	namespace : "pages",
	action : "roadmap",
	type: "get"
}, function(obj){

	appView.returnView({
		no_header : true
	});
	//appView.returnView(data);

});