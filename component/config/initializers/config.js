var master = require('mastercontroller');
var mimes = require('./mime.json');
var request = require('./request.json');
var cors = require('./cors.json');

// initlaizing the tools we need for Master to run properly
master.serverSettings(master.env.server);
master.request.init(request);
master.error.init(master.env.error);
master.router.addMimeList(mimes);

// Initialize Socket.IO via MasterSocket (auto-loads CORS from config/initializers/cors.json)
master.socket.init();
master.sessions.init();
master.cors.init(cors);
master.startMVC("config");


// register these apps to have access to them in the controller.
// example: master.register("mainContext", { anyobject : "name"});

// require as many components you need
// example: master.component("components", "auth");


