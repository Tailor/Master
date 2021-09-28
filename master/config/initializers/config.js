
    var master = require('mastercontroller');
    var mimes = require('./mime.json');
    var request = require('./request.json');
    var cors = require('./cors.json');
    var root = __dirname;

    // initlaizing the tools we need for Master to run properly
    master.serverSettings(master.env.server);
    master.request.init(request);
    master.error.init(master.env.error);
    master.router.addMimeList(mimes);
    master.router.init(root);
    master.socket.init();
    master.sessions.init();
    master.jwt.init().sha256();
    master.cors.init(cors);

    // register these apps to have access to them in the controller.
      // example: master.register("mainContext", { anyobject : "name"});

    // require as many components you need 
      // example: require(`${master.root}/components/myComponent/initializers/config`);

