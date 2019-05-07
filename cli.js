#!/usr/bin/env node

// https://itnext.io/making-cli-app-with-ease-using-commander-js-and-inquirer-js-f3bbd52977ac
const program = require('commander');
var fs = require('fs-extra');
var crypto = require('crypto');
//var Git = require("nodegit");
//var nrc = require('node-run-cmd');

let capitalizeFirstLetter = function(str1){
  return str1.charAt(0).toUpperCase() + str1.slice(1);
}

// npm unlink
// npm link
const [,, ...args] = process.argv

//console.log(`hello ${args}`);

program
  .version('0.0.2', '-v, -version')
  .description('Master is a node web-application framework that includes everything needed to create database-backed web applications according to the Model-View-Controller (MVC) pattern.');

  program
  .command('server')
  .alias('s')
  .description('Start Master Node server')
  .action(function(cmd){
      var dir = process.cwd();
      console.log("starting server");
      require(dir + '/server.js');
    //return "node c:\node\server.js"
  });


  program
  .command('generate <type> <name> [actionName]')
  .alias('g')
  .description('Generate Controllers, Views, Sockets and Scaffoldings')
  .action(function(type, name, actionName){
    if(type !== null){
      if(name !== null){
          var dir = process.cwd();
          switch(type) {
              case "controller":

                        // find controller using name
                        var file = dir + '/app/controllers/' + capitalizeFirstLetter(name) + "Controller.js";
                        if(actionName !== undefined){
                        // read controller template file
                            var result = 
                            
                                  `
                                  let master = require('mastercontroller');
                                  
                                  class ${ capitalizeFirstLetter(name) }Controller extends master.ApplicationController{

                                    constructor() {
                                      super();
                                    }

                                    async ${ capitalizeFirstLetter(actionName) }(params){
                                      return this.returnView();
                                    }

                                  }`;

                            // add template file to controller folder with name
                            fs.writeFile(file, result, 'utf8', function (err) {
                               if (err) return console.log(err)
                               else{
                                    console.log("generated controller with name " + name);

                                    var viewPath = dir + '/app/views/' + capitalizeFirstLetter(name);
                                      // create view folder if non is created
                                    fs.ensureDir(viewPath, function(err){
                                         if (err) return console.log('An error occured while creating folder.');
                                         else{
                                            console.log("generated view folder with name " + name);
                                            // create the view file
                                              var file = viewPath + "/" + capitalizeFirstLetter(actionName) + ".html"
                                              fs.writeFile(file, "", 'utf8', function (err) {
                                                   if (err) return console.log(err)
                                                   else{
                                                      console.log("generated View file with name " + actionName);
                                                   }                             
                                              });
                                         }
                                    });
                               }                             
                            });
                          }
                          else{
                            return console.log('Master generate controller must include(have) action name.');
                          }

                  break;
              case "view":
                      var pathName = dir + '/app/views/' + capitalizeFirstLetter(name);
                      fs.ensureDir(pathName, function(err){
                         if (err) return console.log('An error occured while creating View folder ' + name);
                         else{
                            console.log("generated View folder with name " + name);
                            if(actionName !== undefined){
                                var file = pathName + "/" + capitalizeFirstLetter(actionName) + ".html"
                                fs.writeFile(file, "", 'utf8', function (err) {
                                     if (err) return console.log(err)
                                     else{
                                        console.log("generated View file with name " + actionName);
                                     }                             
                                });
                              }
                         }
                       });

                  break;
              case "socket":

                         // find controller using name
                        var file = dir + '/app/sockets/' + capitalizeFirstLetter(name) + "Socket.js";
                        var pathName = __dirname + "/templates/socket.js";

                        // read socket template file
                        fs.readFile(pathName, 'utf8', function (err,data) {
                            if (err) return console.log("An error occured while creating socket");
                            var result =  data.replace(/AddControllerNameHere/g, capitalizeFirstLetter(name));

                            // add template file to socket folder with name
                            fs.writeFile(file, result, 'utf8', function (err) {
                               if (err) return console.log(err)
                               else{
                                    console.log("generated socket with name " + name);
                               }                             
                            });
                        });

                  break;
              case "scaffold":
                      // TODO: consider creating style sheets in scaffolding

                       // find controller using name
                        var file = dir + '/app/controllers/' + capitalizeFirstLetter(name) + "Controller.js";
                        var pathName = __dirname + "/templates/controller.js"
                        
                        // read controller template file
                        fs.readFile(pathName, 'utf8', function (err,data) {
                            if (err) return console.log("An error occured while creating controller");
                            var updatedResult = data.replace(/<add_name>/g, capitalizeFirstLetter(name));
                            var result =  updatedResult.replace(/AddControllerNameHere/g, capitalizeFirstLetter(name));

                            // add template file to controller folder with name
                            fs.writeFile(file, result, 'utf8', function (err) {
                               if (err) return console.log(err)
                               else{
                                    console.log("generated controller with name " + name);
                                    // read routes.js
                                    var routesPath = dir + '/config/routes.js';
                                    fs.readFile(routesPath, 'utf8', function (err,data) {
                                          if (err) return console.log("An error occured while creating controller routes");
                                          var resource = "master.router.resources('" + name + "');"
                                          var result = data + resource;

                                          // write route resource to routes.js
                                          fs.writeFile(routesPath, result, 'utf8', function (err) {
                                             if (err) return console.log(err)
                                             else{
                                                  console.log("Added route resource to routes.js");
                                                  var viewPath = dir + '/app/views/' + capitalizeFirstLetter(name);
                                                  // create view folder if non is created
                                                  fs.ensureDir(viewPath, function(err){
                                                     if (err) return console.log('An error occured while creating view folder.');
                                                     else{
                                                        console.log("generated view folder with name " + name);
                                                        // todo : create all the files needs for controlller resources
                                                        var formData = `
<%- html.formTag('/${ name }/', { method : "post", multiport: true, class : ""}) %>
  <div class="actions">
    <%- html.submitButton("submit") %>
  </div>
<%- html.formTagEnd(); %>`;
                                                        var indexData = `
<h1>${ name }</h1>

<br>

<%- html.linkTo('${ name }', '/${ name }/new') %>
`;
                                                        var showData = `
<h1>Show ${ name }</h1>
                                                        `;
                                                        var newData = `
<h1>New ${ name } </h1>
<%- html.render('${ name }/_form.html') %>
                                                        `;
                                                        var editData = `
<h1> Edit ${ name } </h1>
<%- html.render('${ name }/_form.html') %>
                                                        `;

                                                        fs.writeFileSync(viewPath + "/" + "_form.html", formData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "Index.html", indexData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "Show.html", showData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "New.html", newData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "Edit.html", editData, 'utf8');

                                                                                 // find controller using name
                                                        var socketTempFile = dir + '/app/sockets/' + capitalizeFirstLetter(name) + "Socket.js";
                                                        var socketPathName = __dirname + "/templates/socket.js";

                                                        // read socket template file
                                                        fs.readFile(socketPathName, 'utf8', function (err,data) {
                                                            if (err) return console.log("An error occured while creating socket");
                                                            var result =  data.replace(/AddControllerNameHere/g, capitalizeFirstLetter(name));
                                                            // add template file to socket folder with name
                                                            fs.writeFile(socketTempFile, result, 'utf8', function (err) {
                                                               if (err) return console.log(err)
                                                               else{
                                                                    console.log("generated socket with name " + name);
                                                               }                             
                                                            });
                                                        });

                                                     }
                                                });
                                             }                             
                                          });
                                      });
                               }                             
                            });
                        });


                  break;
              default:
                  return "You can only generate types : controller, view, socket and scaffolding"
          }
      }
      else{
      return "Please provide a name for " + type;
      }

    }
    else{
      return "Please choose a generator: controller, view";
    }
  });

  program
  .command('new <name>')
  .alias('n')
  .description('Create a new Master application')
  .action(function(name){
    if(name !== null){
      var dir = process.cwd();
      var pathName = dir + "/" + name;
      fs.ensureDir(pathName, function(err){
             if (err) return console.log('An error occured while creating folder.');
             else{
                  // copy source folder to destination
                  fs.copy(__dirname + "/master", pathName, function (err) {
                      if (err) return console.log('An error occured while copying the folder.');
                      
                      var JWThash = crypto.randomBytes(20).toString('hex');
                      var sessionhash = crypto.randomBytes(20).toString('hex');

                      fs.readFile(pathName + "/config/initializers/jwt.js", 'utf8', function (err,data) {
                          if (err) return console.log(err);
                          var result = data.replace(/AddSecretHere/g, JWThash);

                          fs.writeFile(pathName + "/config/initializers/jwt.js", result, 'utf8', function (err) {
                             if (err) return console.log(err)
                              else{
                                fs.readFile(pathName + "/config/initializers/sessions.js", 'utf8', function (err,data) {
                                    if (err) return console.log(err);
                                    var result = data.replace(/AddSecretHere/g, sessionhash);
          
                                    fs.writeFile(pathName + "/config/initializers/sessions.js", result, 'utf8', function (err) {
                                      if (err) return console.log(err)
                                        else{
                                            console.log("Created new Master application named " + name);
                                        };
                                      
                                    });
                                });
                                  
                              };
                             
                          });
                      });
                      
                  });
             }

        });

          // todo: open the config and create a new token and overwrite <ADD_SECRET_HERE> with token
        }
    else{
      return "You must provide a name when creating new applications";
    }
  });

  program.parse(process.argv);

  var toLower = function(v) {
    return v.toLowerCase();
  }


