
    var master = require('mastercontroller');
    var mimes = require('./mime.json');
    var request = require('./request.json');

    // initlaizing the tools we need for Master to run properly
    master.setupServer(master.env.http, master.env.httpPort, master.env.requestTimeout);
    master.request.init(request);
    master.error.init(master.env.error);
    master.router.init(mimes);
    master.socket.init();
    master.sessions.init();
    master.jwt.init().sha256();

    // register these apps to have access to them in the controller.
      // example: master.register("mainContext", { anyobject : "name"});

    // require as many components you need 
      // example: require(`${master.root}/components/myComponent/initializers/config`);

