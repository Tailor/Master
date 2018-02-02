// Master version 0.2 
var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');
var appRouter = require('masterrouter');
require('./routes');
require('./mime');

var http_IP = '127.0.0.1';
var http_port = 8080;


var server = http.createServer(function(req, res) {
  console.log("path", `${req.method} ${req.url}`);
  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract URL path
  let pathname = `.${parsedUrl.pathname}`;

  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  const ext = path.parse(pathname).ext;

  // if extention exist then its a file.
  if(ext === ""){
      require("./config")(req, res);
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
              
              const mimeType = appRouter.findMimeType(ext);

              // if the file is found, set Content-type and send data
              res.setHeader('Content-type', mimeType || 'text/plain' );
              res.end(data);
            }
          });

      });
  }
}); // end server()

server.listen(http_port, http_IP);

