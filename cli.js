#!/usr/bin/env node

// https://itnext.io/making-cli-app-with-ease-using-commander-js-and-inquirer-js-f3bbd52977ac
const program = require('commander');
var fs = require('fs-extra');

// let capitalizeFirstLetter = function(str1){
//   return str1.charAt(0).toUpperCase() + str1.slice(1);
// }

var cliManager = {
    lowercaseFirstLetter : function(str1){
      return str1.charAt(0).toLowerCase() + str1.slice(1);
    },
    buildActionNameList : function(actionNameList){
    var html = '';
      for (var i = 0; i < actionNameList.legth; i++) {
        html += `
        
        async ${ cliManager.lowercaseFirstLetter(myStringArray[i]) }(params){
          return this.returnView();
        }`
      }
    },
    controllerManager : function(type, name, actionName){
        var dir = process.cwd();
        // find controller using name
        var file = dir + '/app/controllers/' + cliManager.lowercaseFirstLetter(name) + "Controller.js";
        if(actionName !== undefined){
        // read controller template file
            var result = 
            
                  `
                      let master = require('mastercontroller');

                      class ${ cliManager.lowercaseFirstLetter(name) }Controller {

                        constructor() {

                        }

                          ${ cliManager.buildActionNameList(actionName) }

                      }

                      module.exports =  ${ cliManager.lowercaseFirstLetter(name) }Controller;

                      `;

            // add template file to controller folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log(err)
              else{
                    console.log("generated controller with name " + name);

                    var viewPath = dir + '/app/views/' + cliManager.lowercaseFirstLetter(name);
                      // create view folder if non is created
                    fs.ensureDir(viewPath, function(err){
                        if (err) return console.log('An error occured while creating folder.');
                        else{
                            console.log("generated view folder with name " + name);
                            // create the view file
                            for (var i = 0; i < actionNameList.legth; i++) {
                              var file = viewPath + "/" + cliManager.lowercaseFirstLetter(actionNameList[i]) + ".html"
                              fs.writeFile(file, "", 'utf8', function (err) {
                                  if (err) return console.log(err)
                                  else{
                                      console.log("generated View file with name " + actionNameList[i]);
                                  }                             
                              });
                            }
                            
                        }
                    });
              }                             
            });
          }
          else{
            return console.log('Master generate controller must include(have) action name.');
          }

    },
    viewManager : function(type, name, actionNameList){
      var dir = process.cwd();
      var pathName = dir + '/app/views/' + cliManager.lowercaseFirstLetter(name);
      fs.ensureDir(pathName, function(err){
        if (err) return console.log('An error occured while creating View folder ' + name);
        else{

            console.log("generated View folder with name " + name);
            if(actionNameList !== undefined){
              for (var i = 0; i < actionNameList.legth; i++) {
                var file = pathName + "/" + cliManager.lowercaseFirstLetter(actionNameList[i]) + ".html"
                fs.writeFile(file, "", 'utf8', function (err) {
                    if (err) return console.log(err)
                    else{
                        console.log("generated View file with name " + actionNameList[i]);
                    }                             
                  });
                }
              }
                
        }
      });

    },
    socketManager : function(type, name, actionName){
        var dir = process.cwd();
        // find controller using name
        var file = dir + '/app/sockets/' + cliManager.lowercaseFirstLetter(name) + "Socket.js";
        var pathName = __dirname + "/templates/socket.js";

        // read socket template file
        fs.readFile(pathName, 'utf8', function (err,data) {
            if (err) return console.log("An error occured while creating socket");
            var result =  data.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

            // add template file to socket folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log(err)
              else{
                    console.log("generated socket with name " + name);
              }                             
            });
        });
    },
    componentManager : function(type, name, actionName){

      var dir = process.cwd();
      var pathName = dir + "/components/" + name;
      fs.mkdir(dir + "/components",{ recursive: true });
      fs.mkdir(dir + "/components/" + name,{ recursive: true });
      fs.mkdir(pathName + "/db",{ recursive: true });
      fs.ensureDir(pathName, function(err){
            if (err) return console.log('An error occured while creating folder.');
            else{
                  // copy source folder to destination
                  fs.copy(__dirname + "/component", pathName, function (err) {
                      if (err) return console.log('An error occured while copying the folder.');
                  
                      fs.readFile(pathName + "/config/routes.js", 'utf8', function (err,data) {
                        if (err) return console.log(err);
                        data.replace(/REPLACEWITHFOLDERNAME/g,  pathName);
                      });
                      
                  });
            }

        });

    },
    scaffoldingManager : function(type, name, actionName){
        // TODO: consider creating style sheets in scaffolding  
      
        var dir = process.cwd();
        // find controller using name
        var file = dir + '/app/controllers/' + cliManager.lowercaseFirstLetter(name) + "Controller.js";
        var pathName = __dirname + "/templates/controller.js";    
        // read controller template file
        fs.readFile(pathName, 'utf8', function (err,data) {
            if (err) return console.log("An error occured while creating controller");
            var updatedResult = data.replace(/<add_name>/g, cliManager.lowercaseFirstLetter(name));
            var result =  updatedResult.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

            // add template file to controller folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log(err)
              else{
                    console.log("generated controller with name " + name);
                    // read routes.js
                    var routesPath = dir + '/config/routes.js';
                    fs.readFile(routesPath, 'utf8', function (err,data) {
                          if (err) return console.log("An error occured while creating controller routes");
                          var resource = "router.resources('" + name + "');"
                          var result = data + resource;

                          // write route resource to routes.js
                          fs.writeFile(routesPath, result, 'utf8', function (err) {
                            if (err) return console.log(err)
                            else{
                                  console.log("Added route resource to routes.js");
                                  var viewPath = dir + '/app/views/' + cliManager.lowercaseFirstLetter(name);
                                  // create view folder if non is created
                                  fs.ensureDir(viewPath, function(err){
                                    if (err) return console.log('An error occured while creating view folder.');
                                    else{
                                        console.log("generated view folder with name " + name);
                                      
                                        var formData = `
                                          \${ html.formTag('/${ name }/', { method : "post", multiport: true, class : ""}) }
                                          <div class="actions">
                                          \${ html.submitButton("submit") }
                                          </div>
                                          \${ html.formTagEnd(); }`;
                                      var indexData = `
                                          <h1>${ name }</h1><br>
                                          \${ html.linkTo('${ name }', '/${ name }/new') }`;
                                      var showData = `
                                            <h1>Show ${ name }</h1>`;
                                      var newData = `
                                            <h1>New ${ name } </h1>
                                            \${ html.render('${ name }/_form.html') }`;
                                      var editData = `
                                            <h1> Edit ${ name } </h1>
                                            \${ html.render('${ name }/_form.html') }`;

                                        fs.writeFileSync(viewPath + "/" + "_form.html", formData, 'utf8');
                                        fs.writeFileSync(viewPath + "/" + "index.html", indexData, 'utf8');
                                        fs.writeFileSync(viewPath + "/" + "show.html", showData, 'utf8');
                                        fs.writeFileSync(viewPath + "/" + "new.html", newData, 'utf8');
                                        fs.writeFileSync(viewPath + "/" + "edit.html", editData, 'utf8');

                                                                // find controller using name
                                        var socketTempFile = dir + '/app/sockets/' + cliManager.lowercaseFirstLetter(name) + "Socket.js";
                                        var socketPathName = __dirname + "/templates/socket.js";

                                        // read socket template file
                                        fs.readFile(socketPathName, 'utf8', function (err,data) {
                                            if (err) return console.log("An error occured while creating socket");
                                            var result =  data.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));
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

    }

}
// npm unlink
// npm link
const [,, ...args] = process.argv

//console.log(`hello ${args}`);

program
  .version('0.0.9')
  .option('-v, --version', '0.0.9') 
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
  .command('help')
  .alias('h')
  .description('A list available subcommands and some concept guides')
  .action(function(cmd){
      var text = `
      These are common Master commands used in various situations:
      Command list: master [--version] [server] [help] [generate <type> <name> [actionName]] [new <name>]

      new               This command creates new applications
      server            Starts the node js server so that you can view the application in a browser
      generate          This is a helper command that will allow you to create controllers, views, sockets, components, and scaffolding`;
      console.log(text);
  });


  program
  .command('generate <type> <name> [actionName]')
  .alias('g')
  .description('Generate Controllers, Views, Sockets and Scaffoldings')
  .action(function(type, name, actionName){
    if(type !== null){
      if(name !== null){
          switch(type) { 
              case "controller":
                  cliManager.controllerManager(type, name, actionName);
                  break;
              case "view":
                  cliManager.viewManager(type, name, actionName);
                  break;
              case "socket":
                  cliManager.socketManager(type, name, actionName);
                  break;
              break;
              case "component":
                  cliManager.componentManager(type, name, actionName);
                  break;
              break
              case "scaffold":
                  cliManager.scaffoldingManager(type, name, actionName);
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
      fs.mkdir(pathName + "/db",{ recursive: true });
      fs.ensureDir(pathName, function(err){
             if (err) return console.log('An error occured while creating folder.');
             else{
                  // copy source folder to destination
                  fs.copy(__dirname + "/master", pathName, function (err) {
                      if (err) return console.log('An error occured while copying the folder.');
                      console.log("Created new Master application named " + name);
                  });
             }

        });
        }
    else{
      return "You must provide a name when creating new applications";
    }
  });

  program.parse(process.argv);


