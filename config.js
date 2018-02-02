var path = require('path');
var fs = require('fs');
var appView = require('masterview');
var appAPI = require('masterapi');
var appRouter = require('masterrouter');
var mongoose = require('mongoose');

module.exports = function(req, res) { 

	//  setup my module apps
	appView.load(req, res, __dirname);
	appAPI.load(req, res);

    appRouter.status("500", "../public/404.html");
    appRouter.status("422", "../public/404.html");
    appRouter.status("404"," ../public/404.html");

    // generate secret keybase on every new project
    appRouter.addToStore("secretKeyBase", "525feac13286fb8fb709e9fe28ce31551ef842e98ec3a1f66135c7e4f21cb9c1ae8a521dad82f85b41a91065310dee6e972dcd33bb1e52fb0cb7a12f7a61cdb4")
	
	// var _db = mongoose.connect('mongodb://localhost:27017/local');

	// app node must always be after loading everything
    appRouter.node(req, res, __dirname);
	
	// adds all the js and css from main asset javascripot and stylesheets folders 
	appView.html.addFolderJS();
	appView.html.addFolderStyles();

}