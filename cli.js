#!/usr/bin/env node

// Master CLI - Command Line Interface for MasterController Framework
const {program} = require('commander');
var fs = require('fs-extra');
const os = require('os');
const path = require('path');

// ========================================
// UTILITY FUNCTIONS
// ========================================

var cliManager = {
    // Lowercase first letter
    lowercaseFirstLetter: function(str1) {
        if (!str1) return '';
        return str1.charAt(0).toLowerCase() + str1.slice(1);
    },

    // Uppercase first letter
    uppercaseFirstLetter: function(str1) {
        if (!str1) return '';
        return str1.charAt(0).toUpperCase() + str1.slice(1);
    },

    // Check if we're in a Master project directory
    isInProjectDirectory: function() {
        var dir = process.cwd();
        var serverFile = path.join(dir, 'server.js');
        var configDir = path.join(dir, 'config');

        return fs.existsSync(serverFile) && fs.existsSync(configDir);
    },

    // Build action list for controller
    buildActionNameListHTML: function(actionNameList) {
        var html = '';
        for (var i = 0; i < actionNameList.length; i++) {
            html += `
    // ${actionNameList[i]} action
    async ${cliManager.lowercaseFirstLetter(actionNameList[i])}(obj) {
        this.render('${cliManager.lowercaseFirstLetter(actionNameList[i])}', {
            title: '${cliManager.uppercaseFirstLetter(actionNameList[i])}'
        });
    }
`;
        }
        return html;
    },

    // ========================================
    // CONTROLLER GENERATOR
    // ========================================
    controllerManager: function(type, name, actionNameList) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var file = path.join(dir, 'app', 'controllers', cliManager.lowercaseFirstLetter(name) + 'Controller.js');

        if (actionNameList !== undefined && actionNameList.length > 0) {
            var result = `const master = require('mastercontroller');

class ${cliManager.lowercaseFirstLetter(name)}Controller {

    constructor(requestObject) {
        // Constructor is called for every request
        this.requestObject = requestObject;

        // Before/After action filters
        // this.beforeAction(["edit", "update"], function(obj) {
        //     if (!isAuthenticated(obj)) {
        //         obj.response.statusCode = 401;
        //         obj.response.end('Unauthorized');
        //         return;
        //     }
        //     this.next();
        // });
    }
${cliManager.buildActionNameListHTML(actionNameList)}
}

module.exports = ${cliManager.lowercaseFirstLetter(name)}Controller;
`;

            fs.writeFile(file, result, 'utf8', function (err) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating controller:', err.message);
                }

                console.log('\x1b[32m%s\x1b[0m', '✅ Generated controller: ' + name + 'Controller.js');

                // Create view folder
                var viewPath = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));
                fs.ensureDir(viewPath, function(err) {
                    if (err) {
                        return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating view folder:', err.message);
                    }

                    console.log('\x1b[32m%s\x1b[0m', '✅ Generated view folder: ' + name + '/');

                    // Create view files
                    for (var i = 0; i < actionNameList.length; i++) {
                        var viewFile = path.join(viewPath, cliManager.lowercaseFirstLetter(actionNameList[i]) + '.html');
                        var viewContent = `<h2>{{title}}</h2>

<p>This is the ${actionNameList[i]} view for ${name}.</p>

<!-- Add your content here -->
`;
                        fs.writeFileSync(viewFile, viewContent, 'utf8');
                        console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: ' + actionNameList[i] + '.html');
                    }
                });
            });
        } else {
            return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Controller must include action names.');
        }
    },

    // ========================================
    // VIEW GENERATOR
    // ========================================
    viewManager: function(type, name, actionNameList) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var pathName = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));

        fs.ensureDir(pathName, function(err) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating view folder:', err.message);
            }

            console.log('\x1b[32m%s\x1b[0m', '✅ Generated view folder: ' + name + '/');

            if (actionNameList !== undefined && actionNameList.length > 0) {
                for (var i = 0; i < actionNameList.length; i++) {
                    var file = path.join(pathName, cliManager.lowercaseFirstLetter(actionNameList[i]) + '.html');
                    var content = `<h2>${cliManager.uppercaseFirstLetter(actionNameList[i])}</h2>

<p>This is the ${actionNameList[i]} view.</p>
`;
                    fs.writeFileSync(file, content, 'utf8');
                    console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: ' + actionNameList[i] + '.html');
                }
            }
        });
    },

    // ========================================
    // MIDDLEWARE GENERATOR (NEW)
    // ========================================
    middlewareManager: function(type, name) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var middlewareDir = path.join(dir, 'middleware');

        // Ensure middleware directory exists
        fs.ensureDir(middlewareDir, function(err) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating middleware directory:', err.message);
            }

            // Find next number for middleware file
            var files = fs.readdirSync(middlewareDir).filter(f => f.endsWith('.js') && !f.endsWith('.example'));
            var nextNum = files.length + 1;
            var numPrefix = String(nextNum).padStart(2, '0');

            var fileName = `${numPrefix}-${cliManager.lowercaseFirstLetter(name)}.js`;
            var filePath = path.join(middlewareDir, fileName);

            var content = `/**
 * ${cliManager.uppercaseFirstLetter(name)} Middleware
 *
 * Description: Add your middleware description here
 *
 * This middleware is auto-loaded and runs in alphabetical order.
 */

module.exports = async (ctx, next) => {
    // Before request processing
    console.log('[${cliManager.uppercaseFirstLetter(name)}] Processing request:', ctx.request.url);

    // Continue to next middleware
    await next();

    // After response processing
    console.log('[${cliManager.uppercaseFirstLetter(name)}] Request completed');
};

// ALTERNATIVE PATTERN: For path-specific middleware
// module.exports = {
//     register: (master) => {
//         master.pipeline.map('/api/*', (api) => {
//             api.use(async (ctx, next) => {
//                 // Your middleware logic here
//                 await next();
//             });
//         });
//     }
// };
`;

            fs.writeFile(filePath, content, 'utf8', function(err) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating middleware:', err.message);
                }

                console.log('\x1b[32m%s\x1b[0m', '✅ Generated middleware: ' + fileName);
                console.log('\x1b[36m%s\x1b[0m', 'ℹ️  Middleware will be auto-loaded on server start');
            });
        });
    },

    // ========================================
    // SOCKET GENERATOR
    // ========================================
    socketManager: function(type, name, actionName) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var socketsDir = path.join(dir, 'app', 'sockets');
        var file = path.join(socketsDir, cliManager.lowercaseFirstLetter(name) + 'Socket.js');
        var templatePath = path.join(__dirname, 'templates', 'socket.js');

        fs.ensureDir(socketsDir, function(err) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating sockets directory:', err.message);
            }

            fs.readFile(templatePath, 'utf8', function (err, data) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error reading socket template:', err.message);
                }

                var result = data.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

                fs.writeFile(file, result, 'utf8', function (err) {
                    if (err) {
                        return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating socket:', err.message);
                    }
                    console.log('\x1b[32m%s\x1b[0m', '✅ Generated socket: ' + name + 'Socket.js');
                });
            });
        });
    },

    // ========================================
    // COMPONENT GENERATOR
    // ========================================
    componentManager: function(type, name, actionName) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var componentsDir = path.join(dir, 'components');
        var componentPath = path.join(componentsDir, name);

        fs.ensureDir(componentsDir, function(err) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating components directory:', err.message);
            }

            fs.ensureDir(componentPath, function(err) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating component directory:', err.message);
                }

                // Copy component template
                fs.copy(path.join(__dirname, 'component'), componentPath, function (err) {
                    if (err) {
                        return console.log('\x1b[31m%s\x1b[0m', '❌ Error copying component template:', err.message);
                    }

                    // Update routes.js with component name
                    var routesFile = path.join(componentPath, 'config', 'routes.js');
                    fs.readFile(routesFile, 'utf8', function (err, data) {
                        if (err) {
                            return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not update routes.js');
                        }

                        var updatedData = data.replace(/COMPONENTNAME/g, name);
                        fs.writeFile(routesFile, updatedData, 'utf8', function(err) {
                            if (err) {
                                console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not update component routes');
                            }
                        });
                    });

                    console.log('\x1b[32m%s\x1b[0m', '✅ Generated component: ' + name);
                    console.log('\x1b[36m%s\x1b[0m', 'ℹ️  To use this component, add to config/initializers/config.js:');
                    console.log('\x1b[36m%s\x1b[0m', `   master.component('components', '${name}');`);
                });
            });
        });
    },

    // ========================================
    // SCAFFOLDING GENERATOR
    // ========================================
    scaffoldingManager: function(type, name, actionName) {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        var file = path.join(dir, 'app', 'controllers', cliManager.lowercaseFirstLetter(name) + 'Controller.js');
        var templatePath = path.join(__dirname, 'templates', 'controller.js');

        fs.readFile(templatePath, 'utf8', function (err, data) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error reading controller template:', err.message);
            }

            var updatedResult = data.replace(/<add_name>/g, cliManager.lowercaseFirstLetter(name));
            var result = updatedResult.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));

            fs.writeFile(file, result, 'utf8', function (err) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating controller:', err.message);
                }

                console.log('\x1b[32m%s\x1b[0m', '✅ Generated controller: ' + name + 'Controller.js');

                // Add route resource
                var routesPath = path.join(dir, 'config', 'routes.js');
                fs.readFile(routesPath, 'utf8', function (err, data) {
                    if (err) {
                        return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not update routes.js');
                    }

                    var resource = `\n// RESTful routes for ${name}\nrouter.resources('${cliManager.lowercaseFirstLetter(name)}');`;
                    var result = data + os.EOL + resource;

                    fs.writeFile(routesPath, result, 'utf8', function (err) {
                        if (err) {
                            return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not add route resource');
                        }

                        console.log('\x1b[32m%s\x1b[0m', '✅ Added RESTful routes to routes.js');

                        // Create views
                        var viewPath = path.join(dir, 'app', 'views', cliManager.lowercaseFirstLetter(name));
                        fs.ensureDir(viewPath, function(err) {
                            if (err) {
                                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating view folder:', err.message);
                            }

                            console.log('\x1b[32m%s\x1b[0m', '✅ Generated view folder: ' + name + '/');

                            // Create view templates
                            var formData = `<form action="/${cliManager.lowercaseFirstLetter(name)}" method="post">
    <!-- Add your form fields here -->
    <div class="form-group">
        <label for="name">Name</label>
        <input type="text" name="name" id="name" class="form-control" required>
    </div>

    <div class="actions">
        <button type="submit" class="btn btn-primary">Submit</button>
        <a href="/${cliManager.lowercaseFirstLetter(name)}" class="btn btn-secondary">Cancel</a>
    </div>
</form>`;

                            var indexData = `<h1>${cliManager.uppercaseFirstLetter(name)}</h1>

<a href="/${cliManager.lowercaseFirstLetter(name)}/new" class="btn btn-primary">New ${cliManager.uppercaseFirstLetter(name)}</a>

<div class="list">
    {{#each items}}
        <div class="item">
            <a href="/${cliManager.lowercaseFirstLetter(name)}/{{this.id}}">{{this.name}}</a>
        </div>
    {{/each}}
</div>`;

                            var showData = `<h1>{{title}}</h1>

<div class="details">
    <!-- Display ${name} details here -->
    <p>ID: {{id}}</p>
</div>

<div class="actions">
    <a href="/${cliManager.lowercaseFirstLetter(name)}/{{id}}/edit" class="btn btn-primary">Edit</a>
    <a href="/${cliManager.lowercaseFirstLetter(name)}" class="btn btn-secondary">Back</a>
</div>`;

                            var newData = `<h1>New ${cliManager.uppercaseFirstLetter(name)}</h1>

{{> ${cliManager.lowercaseFirstLetter(name)}/_form}}`;

                            var editData = `<h1>Edit ${cliManager.uppercaseFirstLetter(name)}</h1>

{{> ${cliManager.lowercaseFirstLetter(name)}/_form}}`;

                            fs.writeFileSync(path.join(viewPath, '_form.html'), formData, 'utf8');
                            fs.writeFileSync(path.join(viewPath, 'index.html'), indexData, 'utf8');
                            fs.writeFileSync(path.join(viewPath, 'show.html'), showData, 'utf8');
                            fs.writeFileSync(path.join(viewPath, 'new.html'), newData, 'utf8');
                            fs.writeFileSync(path.join(viewPath, 'edit.html'), editData, 'utf8');

                            console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: _form.html');
                            console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: index.html');
                            console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: show.html');
                            console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: new.html');
                            console.log('\x1b[32m%s\x1b[0m', '  ✅ Created view: edit.html');

                            // Create socket
                            var socketFile = path.join(dir, 'app', 'sockets', cliManager.lowercaseFirstLetter(name) + 'Socket.js');
                            var socketTemplatePath = path.join(__dirname, 'templates', 'socket.js');

                            fs.readFile(socketTemplatePath, 'utf8', function (err, data) {
                                if (err) {
                                    return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not create socket');
                                }

                                var result = data.replace(/AddControllerNameHere/g, cliManager.lowercaseFirstLetter(name));
                                fs.writeFile(socketFile, result, 'utf8', function (err) {
                                    if (err) {
                                        return console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: Could not create socket');
                                    }
                                    console.log('\x1b[32m%s\x1b[0m', '✅ Generated socket: ' + name + 'Socket.js');
                                    console.log('\x1b[32m%s\x1b[0m', '\n🎉 Scaffolding complete!');
                                });
                            });
                        });
                    });
                });
            });
        });
    }
};

// ========================================
// CLI COMMANDS
// ========================================

const packageJson = require('./package.json');

program
    .version(packageJson.version, '-v, --version', 'Output the current version')
    .description('Master CLI - MasterController framework command line interface');

// SERVER COMMAND
program
    .command('server')
    .alias('s')
    .description('Start the Master Node.js server')
    .action(function() {
        if (!cliManager.isInProjectDirectory()) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please run this command from inside a Master project directory.');
        }

        var dir = process.cwd();
        console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Master server...\n');
        require(path.join(dir, 'server.js'));
    });

// HELP COMMAND
program
    .command('help')
    .alias('h')
    .description('Display help information')
    .action(function() {
        var text = `
\x1b[36m╔═══════════════════════════════════════════════════════════╗
║           MasterController CLI - Help Guide              ║
╚═══════════════════════════════════════════════════════════╝\x1b[0m

\x1b[33mCOMMAND OVERVIEW\x1b[0m
  master [command] [options]

\x1b[33mAVAILABLE COMMANDS\x1b[0m

  \x1b[32mnew <name>\x1b[0m
    Create a new Master application
    Example: master new my-app

  \x1b[32mserver\x1b[0m (alias: s)
    Start the Node.js server
    Example: master server

  \x1b[32mgenerate <type> <name> [actions...]\x1b[0m (alias: g)
    Generate application components

    Types:
      \x1b[36mcontroller\x1b[0m <name> [actions...]  - Generate controller with actions
      \x1b[36mview\x1b[0m <name> [views...]          - Generate view folder with files
      \x1b[36mmiddleware\x1b[0m <name>               - Generate middleware file
      \x1b[36msocket\x1b[0m <name>                   - Generate socket file
      \x1b[36mcomponent\x1b[0m <name>                - Generate component module
      \x1b[36mscaffold\x1b[0m <name>                 - Generate full CRUD scaffold

    Examples:
      master g controller users index show edit
      master g middleware auth
      master g scaffold posts
      master g component admin

  \x1b[32mhelp\x1b[0m (alias: h)
    Display this help information

  \x1b[32m--version\x1b[0m (alias: -v)
    Display CLI version

\x1b[33mGETTING STARTED\x1b[0m

  1. Create new application:
     \x1b[36mmaster new my-app\x1b[0m

  2. Navigate to directory:
     \x1b[36mcd my-app\x1b[0m

  3. Install dependencies:
     \x1b[36mnpm install\x1b[0m

  4. Start server:
     \x1b[36mmaster server\x1b[0m

\x1b[33mDOCUMENTATION\x1b[0m

  README.md      - Complete API documentation
  QUICKSTART.md  - Quick start guide
  middleware/README.md - Middleware patterns

\x1b[33mSUPPORT\x1b[0m

  GitHub: https://github.com/alexanderrich/mastercontroller
  Issues: https://github.com/alexanderrich/mastercontroller/issues

`;
        console.log(text);
    });

// GENERATE COMMAND
program
    .command('generate <type> <name> [actionName...]')
    .alias('g')
    .description('Generate controllers, views, middleware, sockets, components, or scaffolds')
    .action(function(type, name, actionName) {
        if (!type) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please specify a generator type (controller, view, middleware, socket, component, scaffold)');
        }

        if (!name) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Please provide a name for the ' + type);
        }

        console.log('\x1b[36m%s\x1b[0m', `\n🔨 Generating ${type}: ${name}...\n`);

        switch(type) {
            case "controller":
                cliManager.controllerManager(type, name, actionName);
                break;
            case "view":
                cliManager.viewManager(type, name, actionName);
                break;
            case "middleware":
                cliManager.middlewareManager(type, name);
                break;
            case "socket":
                cliManager.socketManager(type, name, actionName);
                break;
            case "component":
                cliManager.componentManager(type, name, actionName);
                break;
            case "scaffold":
                cliManager.scaffoldingManager(type, name, actionName);
                break;
            default:
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Unknown generator type. Available types: controller, view, middleware, socket, component, scaffold');
        }
    });

// NEW APPLICATION COMMAND
program
    .command('new <name>')
    .alias('n')
    .description('Create a new Master application')
    .action(function(name) {
        if (!name) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: You must provide a name when creating new applications');
        }

        var dir = process.cwd();
        var pathName = path.join(dir, name);

        // Check if directory already exists
        if (fs.existsSync(pathName)) {
            return console.log('\x1b[31m%s\x1b[0m', '❌ Error: Directory "' + name + '" already exists');
        }

        console.log('\x1b[36m%s\x1b[0m', '\n📦 Creating new Master application: ' + name + '...\n');

        // Create necessary directories
        fs.mkdirSync(path.join(pathName, 'db'), { recursive: true });
        fs.mkdirSync(path.join(pathName, 'components'), { recursive: true });
        fs.mkdirSync(path.join(pathName, 'middleware'), { recursive: true });

        fs.ensureDir(pathName, function(err) {
            if (err) {
                return console.log('\x1b[31m%s\x1b[0m', '❌ Error creating application directory:', err.message);
            }

            // Copy master template
            fs.copy(path.join(__dirname, 'master'), pathName, function (err) {
                if (err) {
                    return console.log('\x1b[31m%s\x1b[0m', '❌ Error copying application template:', err.message);
                }

                console.log('\x1b[32m%s\x1b[0m', '✅ Created application structure');
                console.log('\x1b[32m%s\x1b[0m', '✅ Copied template files');
                console.log('\x1b[32m%s\x1b[0m', '\n🎉 Successfully created Master application: ' + name);
                console.log('\x1b[36m%s\x1b[0m', '\nNext steps:');
                console.log('\x1b[36m%s\x1b[0m', '  1. cd ' + name);
                console.log('\x1b[36m%s\x1b[0m', '  2. npm install');
                console.log('\x1b[36m%s\x1b[0m', '  3. master server (or: node server.js)');
                console.log('\x1b[36m%s\x1b[0m', '\nFor more help: master help');
                console.log('\x1b[36m%s\x1b[0m', 'Documentation: README.md, QUICKSTART.md\n');
            });
        });
    });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
