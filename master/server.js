
var master = require('mastercontroller');
var fs = require('fs');
var server =  master.setupServer("http");

// get environment from variable set when server is being ran. example:  master=development node server.js
master.environmentType = process.env.master;
master.root = __dirname;
master.addInternalTools(["MasterError", "MasterRouter", "MasterHtml", "MasterTemp" , "MasterAction", "MasterActionFilters", "MasterSocket", "MasterSession", "MasterRequest", "MasterCors", "TemplateOverwrite"]);
master.start(server);
require("./config/initializers/config");

