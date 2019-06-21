#!/usr/bin/env node

// https://itnext.io/making-cli-app-with-ease-using-commander-js-and-inquirer-js-f3bbd52977ac
const program = require('commander');
var fs = require('fs-extra');
var crypto = require('crypto');

let capitalizeFirstLetter = function(str1){
  return str1.charAt(0).toUpperCase() + str1.slice(1);
}

let lowercaseFirstLetter = function(str1){
  return str1.charAt(0).toLowerCase() + str1.slice(1);
}

// npm unlink
// npm link
const [,, ...args] = process.argv

//console.log(`hello ${args}`);

program
  .version('0.0.6')
  .option('-v, --version', '0.0.6') 
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
      var text = ``;
      console.log(text);
  });


  program
  .command('')
  .description('Get in')
  .action(function(cmd){
      
      var text =  `usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
      [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
      [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
      [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
      <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
clone      Clone a repository into a new directory
init       Create an empty Git repository or reinitialize an existing one

work on the current change (see also: git help everyday)
add        Add file contents to the index
mv         Move or rename a file, a directory, or a symlink
reset      Reset current HEAD to the specified state
rm         Remove files from the working tree and from the index

examine the history and state (see also: git help revisions)
bisect     Use binary search to find the commit that introduced a bug
grep       Print lines matching a pattern
log        Show commit logs
show       Show various types of objects
status     Show the working tree status

grow, mark and tweak your common history
branch     List, create, or delete branches
checkout   Switch branches or restore working tree files
commit     Record changes to the repository
diff       Show changes between commits, commit and working tree, etc
merge      Join two or more development histories together
rebase     Reapply commits on top of another base tip
tag        Create, list, delete or verify a tag object signed with GPG

collaborate (see also: git help workflows)
fetch      Download objects and refs from another repository
pull       Fetch from and integrate with another repository or a local branch
push       Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands and some
concept guides. See 'git help <command>' or 'git help <concept>'
to read about a specific subcommand or concept.`;
      console.log(text);
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
                        var file = dir + '/app/controllers/' + lowercaseFirstLetter(name) + "Controller.js";
                        if(actionName !== undefined){
                        // read controller template file
                            var result = 
                            
                                  `
let master = require('mastercontroller');

class ${ lowercaseFirstLetter(name) }Controller {

  constructor() {

  }

  async ${ lowercaseFirstLetter(actionName) }(params){
    return this.returnView();
  }

}

module.exports =  ${ lowercaseFirstLetter(name) }Controller;

`;

                            // add template file to controller folder with name
                            fs.writeFile(file, result, 'utf8', function (err) {
                               if (err) return console.log(err)
                               else{
                                    console.log("generated controller with name " + name);

                                    var viewPath = dir + '/app/views/' + lowercaseFirstLetter(name);
                                      // create view folder if non is created
                                    fs.ensureDir(viewPath, function(err){
                                         if (err) return console.log('An error occured while creating folder.');
                                         else{
                                            console.log("generated view folder with name " + name);
                                            // create the view file
                                              var file = viewPath + "/" + lowercaseFirstLetter(actionName) + ".html"
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
                      var pathName = dir + '/app/views/' + lowercaseFirstLetter(name);
                      fs.ensureDir(pathName, function(err){
                         if (err) return console.log('An error occured while creating View folder ' + name);
                         else{
                            console.log("generated View folder with name " + name);
                            if(actionName !== undefined){
                                var file = pathName + "/" + lowercaseFirstLetter(actionName) + ".html"
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
                        var file = dir + '/app/sockets/' + lowercaseFirstLetter(name) + "Socket.js";
                        var pathName = __dirname + "/templates/socket.js";

                        // read socket template file
                        fs.readFile(pathName, 'utf8', function (err,data) {
                            if (err) return console.log("An error occured while creating socket");
                            var result =  data.replace(/AddControllerNameHere/g, lowercaseFirstLetter(name));

                            // add template file to socket folder with name
                            fs.writeFile(file, result, 'utf8', function (err) {
                               if (err) return console.log(err)
                               else{
                                    console.log("generated socket with name " + name);
                               }                             
                            });
                        });

              break;
              case "component":

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
                                  
                                  var JWThash = crypto.randomBytes(20).toString('hex');
                                  var sessionhash = crypto.randomBytes(20).toString('hex');

                                  fs.readFile(pathName + "/config/routes.js", 'utf8', function (err,data) {
                                    if (err) return console.log(err);
                                    data.replace(/REPLACEWITHFOLDERNAME/g,  pathName);
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
                                                          console.log("Created new component named " + name);
                                                      };
                                                    
                                                  });
                                              });
                                                
                                            };
                                          
                                        });
                                    });
                                  });
                                  
                              });
                        }
            
                    });
              break
              case "scaffold":
                      // TODO: consider creating style sheets in scaffolding

                       // find controller using name
                        var file = dir + '/app/controllers/' + lowercaseFirstLetter(name) + "Controller.js";
                        var pathName = __dirname + "/templates/controller.js"
                        
                        // read controller template file
                        fs.readFile(pathName, 'utf8', function (err,data) {
                            if (err) return console.log("An error occured while creating controller");
                            var updatedResult = data.replace(/<add_name>/g, lowercaseFirstLetter(name));
                            var result =  updatedResult.replace(/AddControllerNameHere/g, lowercaseFirstLetter(name));

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
                                                  var viewPath = dir + '/app/views/' + lowercaseFirstLetter(name);
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
                                                        fs.writeFileSync(viewPath + "/" + "index.html", indexData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "show.html", showData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "new.html", newData, 'utf8');
                                                        fs.writeFileSync(viewPath + "/" + "edit.html", editData, 'utf8');

                                                                                 // find controller using name
                                                        var socketTempFile = dir + '/app/sockets/' + lowercaseFirstLetter(name) + "Socket.js";
                                                        var socketPathName = __dirname + "/templates/socket.js";

                                                        // read socket template file
                                                        fs.readFile(socketPathName, 'utf8', function (err,data) {
                                                            if (err) return console.log("An error occured while creating socket");
                                                            var result =  data.replace(/AddControllerNameHere/g, lowercaseFirstLetter(name));
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
      fs.mkdir(pathName + "/db",{ recursive: true });
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


