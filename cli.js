#!/usr/bin/env node

// https://itnext.io/making-cli-app-with-ease-using-commander-js-and-inquirer-js-f3bbd52977ac
const {program} = require('commander');
var fs = require('fs-extra');
const os = require('os');
const path = require('path');

// let capitalizeFirstLetter = function(str1){
//   return str1.charAt(0).toUpperCase() + str1.slice(1);
// }

var cliManager = {
    lowercaseFirstLetter : function(str1){
      return str1.charAt(0).toLowerCase() + str1.slice(1);
    },
    buildActionNameListHTML : function(actionNameList){
      var html = '';
      for (var i = 0; i < actionNameList.length; i++) {

        html += `
  async ${ cliManager.lowercaseFirstLetter(actionNameList[i]) }(params){
    return this.returnView();
  }
`
      }
      return html;
    },
    controllerManager : function(type, name, actionNameList){
        var dir = process.cwd();
        // find controller using name
        var file = path.join(dir, 'app', 'controllers', cliManager.lowercaseFirstLetter(name) + 'Controller.js');
        if(actionNameList !== undefined){
        // read controller template file
            var result = 
            
                  `
let master = require('mastercontroller');

class ${ cliManager.lowercaseFirstLetter(name) }Controller {
  constructor() {

  }
    ${ cliManager.buildActionNameListHTML(actionNameList) }
}

module.exports =  ${ cliManager.lowercaseFirstLetter(name) }Controller;

                      `;

            // add template file to controller folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log("--- Please run command from inside the project folder ---- ",err)
              else{
                    console.log("generated controller with name " + name);

                    var viewPath = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));
                      // create view folder if non is created
                    fs.ensureDir(viewPath, function(err){
                        if (err) return console.log('An error occured while creating folder.');
                        else{
                            console.log("generated view folder with name " + name);
                            // create the view file
                            for (var i = 0; i < actionNameList.length; i++) {
                              var file = path.join(viewPath, cliManager.lowercaseFirstLetter(actionNameList[i]) + '.html');
                              fs.writeFile(file, "", 'utf8', function (err) {
                                  if (err) return console.log(err)
                                                             
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
      var pathName = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));
      fs.ensureDir(pathName, function(err){
        if (err) return console.log("--- Please run command from inside the project folder ---- ", 'An error occured while creating View folder ' + name);
        else{

            console.log("generated View folder with name " + name);
            if(actionNameList !== undefined){
              for (var i = 0; i < actionNameList.length; i++) {
                var file = path.join(pathName, cliManager.lowercaseFirstLetter(actionNameList[i]) + '.html');
                fs.writeFile(file, "", 'utf8', function (err) {
                    if (err) return console.log("--- Please run command from inside the project folder ---- ",err)
                    else{
                        console.log("generated view file with name " + actionNameList[i]);
                    }                             
                  });
                }
              }
                
        }
      });

    },
    socketManager : function(type, name, actionName){
        var dir = process.cwd();
        // write socket into app/sockets
        var socketsDir = path.join(dir, 'app', 'sockets');
        var file = path.join(socketsDir, cliManager.lowercaseFirstLetter(name) + 'Socket.js');
        var pathName = path.join(__dirname, 'templates', 'socket.js');

        // read socket template file
        fs.ensureDir(socketsDir, function(err){
          if (err) return console.log("--- Please run command from inside the project folder ---- ", 'An error occured while creating sockets folder.');
          fs.readFile(pathName, 'utf8', function (err,data) {
            if (err) return console.log("--- Please run command from inside the project folder ---- ", "An error occured while creating socket");
            var result =  data.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

            // add template file to socket folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log("--- Please run command from inside the project folder ---- ", err)
              else{
                    console.log("generated socket with name " + name);
              }                             
            });
          });
        });
    },
    componentManager : function(type, name, actionName){

      var dir = process.cwd();
      var pathName = path.join(dir, name);
      fs.ensureDir(pathName, function(err){
            if (err) return console.log("--- Please run command from inside the project folder ---- ", 'An error occured while creating folder.');
            else{
                  // copy source folder to destination
                  fs.copy(path.join(__dirname, 'component'), pathName, function (err) {
                      if (err) return console.log('An error occured while copying the folder.');
                  
                      fs.readFile(path.join(pathName, 'config', 'routes.js'), 'utf8', function (err,data) {
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
        var file = path.join(dir, 'app', 'controllers', cliManager.lowercaseFirstLetter(name) + 'Controller.js');
        var pathName = path.join(__dirname, 'templates', 'controller.js');    
        // read controller template file
        fs.readFile(pathName, 'utf8', function (err,data) {
            if (err) return console.log("--- Please run command from inside the project folder ---- ", "An error occured while creating controller");
            var updatedResult = data.replace(/<add_name>/g, cliManager.lowercaseFirstLetter(name));
            var result =  updatedResult.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

            // add template file to controller folder with name
            fs.writeFile(file, result, 'utf8', function (err) {
              if (err) return console.log(err)
              else{
                    console.log("generated controller with name " + name);
                    // read routes.js
                    var routesPath = path.join(dir, 'config', 'routes.js');
                    fs.readFile(routesPath, 'utf8', function (err,data) {
                          if (err) return console.log("--- Please run command from inside the project folder ---- ", "An error occured while creating controller routes");
                          var resource = "router.resources('" + name + "');"
                          var result = data + os.EOL + resource;

                          // write route resource to routes.js
                          fs.writeFile(routesPath, result, 'utf8', function (err) {
                            if (err) return console.log("--- Please run command from inside the project folder ---- ", err)
                            else{
                                  console.log("Added route resource to routes.js");
                                  var viewPath = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));
                                  // create view folder if non is created
                                  fs.ensureDir(viewPath, function(err){
                                    if (err) return console.log("--- Please run command from inside the project folder ---- ", 'An error occured while creating view folder.');
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

                                        fs.writeFileSync(path.join(viewPath, '_form.html'), formData, 'utf8');
                                        fs.writeFileSync(path.join(viewPath, 'index.html'), indexData, 'utf8');
                                        fs.writeFileSync(path.join(viewPath, 'show.html'), showData, 'utf8');
                                        fs.writeFileSync(path.join(viewPath, 'new.html'), newData, 'utf8');
                                        fs.writeFileSync(path.join(viewPath, 'edit.html'), editData, 'utf8');

                                                                // find controller using name
                                        var socketTempFile = path.join(dir, 'app', 'sockets', cliManager.lowercaseFirstLetter(name) + 'Socket.js');
                                        var socketPathName = path.join(__dirname, 'templates', 'socket.js');

                                        // read socket template file
                                        fs.readFile(socketPathName, 'utf8', function (err,data) {
                                            if (err) return console.log("--- Please run command from inside the project folder ---- ", "An error occured while creating socket");
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

// Read version from package.json
const packageJson = require('./package.json');

program
  .version(packageJson.version, '-v, --version', packageJson.version)
  .description('Master is a node web-application framework that includes everything needed to create database-backed web applications according to the Model-View-Controller (MVC) pattern.');

  program
  .command('server')
  .alias('s')
  .description('Start Master Node server')
  .action(function(cmd){
      var dir = process.cwd();
      // Check if we're in a master project by looking for server.js in a master subdirectory
      var serverPath = path.join(dir, 'master', 'server.js');
      if (!fs.existsSync(serverPath)) {
        serverPath = path.join(dir, 'server.js');
      }
      console.log("starting server");
      require(serverPath);
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
  .command('generate <type> <name> [actionName...]')
  .alias('g')
  .description('Generate Controllers, Views, components, Sockets and Scaffoldings')
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
      var pathName = path.join(dir, name);
      fs.mkdir(path.join(pathName, 'db'),{ recursive: true });
      fs.mkdir(path.join(pathName, 'components'),{ recursive: true });
      fs.mkdir(path.join(pathName, 'sockets'),{ recursive: true });
      fs.ensureDir(pathName, function(err){
             if (err) return console.log('An error occured while creating folder.');
             else{
                  // copy source folder to destination
                  fs.copy(path.join(__dirname, 'master'), pathName, function (err) {
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


