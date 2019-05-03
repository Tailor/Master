// Master version 0.2 
var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');
var master = require('mastercontroller');
master.root = __dirname;
master.require(["MasterError", "MasterRouter", "MasterView", "MasterHtml", "MasterTemp" , "MasterAction", "MasterActionFilters", "MasterSocket", "MasterJWT", "MasterSession"]);
require('./config/routes');
require("./config/initializers/config");

var server = http.createServer(async function(req, res) {
  console.log("path", `${req.method} ${req.url}`);
  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract URL path
  let pathname = `.${parsedUrl.pathname}`;

  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  const ext = path.parse(pathname).ext;

  // if extention exist then its a file.
  if(ext === ""){
    if(true){ // update in settings
      // ->withHeader('Access-Control-Allow-Origin', '*')
      // ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
      // ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');
      //res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    
    var requestObject = await master.middleware(req, res);
    if(requestObject !== -1){
      require("./config/load")(requestObject);
    }
  }
  else{

      fs.exists(pathname, function (exist) {

          if(!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
          }

          // if is a directory search for index file matching the extention
          if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

          // read file from file system
          fs.readFile(pathname, function(err, data){
            if(err){
              res.statusCode = 500;
              res.end(`Error getting the file: ${err}.`);
            } else {
              const mimeType = master.router.findMimeType(ext);
              
              // if the file is found, set Content-type and send data
              res.setHeader('Content-type', mimeType || 'text/plain' );
              res.end(data);
            }
          });

      });
  }
}); // end server()

var io = require('socket.io')(server);

io.on('connection', function(socket) {
  socket.onevent = function (packet) {
      var args = packet.data || [];
      master.socket.load(args, socket, io);
  };
});

server.timeout = master.env.requestTimeout;
server.listen(master.env.httpPort, master.env.http);

