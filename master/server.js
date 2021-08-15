// Master version 0.3.2
var master = require('mastercontroller');
//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8'); // add your own key to get https working
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8'); // add your own crt to get https working
// var credentials = {key: privateKey, cert: certificate}; 

var server = master.setupServer("http"); // send credentials and add https to setup https sever

var io = require('socket.io')(server);

io.on('connection', function(socket) {
  socket.onevent = function (packet) {
      var args = packet.data || [];
      master.socket.load(args, socket, io);
  };
});

master.environmentType = process.env.master;
master.root = __dirname;
master.addInternalTools(["MasterError", "MasterRouter", "MasterHtml", "MasterTemp" , "MasterAction", "MasterActionFilters", "MasterSocket", "MasterJWT", "MasterSession", "MasterRequest", "MasterCors"]);
master.start(server);
require("./config/initializers/config");

