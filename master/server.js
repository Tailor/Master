var master = require('mastercontroller');

// Get environment from variable set when server is being ran
// Example: master=development node server.js
master.environmentType = process.env.master || process.env.NODE_ENV || 'development';
master.root = __dirname;

// Setup server (internal tools are auto-loaded)
var server = master.setupServer("http");

// Load configuration (registers middleware, routes, DI services)
require("./config/initializers/config");

master.start(server);
