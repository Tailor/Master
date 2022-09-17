// Dont need to load everything main Config file loaded
var master = require('mastercontroller');

// initlaizing the tools we need for Master to run properly
master.router.start();


// register these apps to have access to them in the controller.
  // example: master.register("mainContext", { anyobject : "name"});

// require as many components you need 
  // example: require(`${master.root}/components/myComponent/initializers/config`);
