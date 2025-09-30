## Master CLI

A batteries-included Node.js web application toolkit for building data-backed apps with clear layers: routing, controllers, views, sockets, and records. Master focuses on convention over configuration to help you scaffold and ship fast.

Under the hood, the runtime uses two companion libraries:
- mastercontroller: Provides the HTTP server, routing, controller base methods, templating hooks, sessions, requests, CORS, sockets, and more.
- masterrecord: Lightweight data-access layer for models/records.

The CLI ties these together so you can generate apps and features with a single command.

### Features at a glance
- Project scaffolding with sensible defaults
- Generators for controllers, views, sockets, and full scaffolds
- File-based routing via `config/routes.js`
- Server bootstrap via `mastercontroller`
- Optional realtime via Socket.IO
- Cross-platform (macOS, Windows, Linux)

---

## Installation

```bash
npm install -g master
```

From a clone of this repo for local development/testing:

```bash
npm install -g ./
```

Verify installation:

```bash
master --version
```

---

## Quick start

```bash
master new myapp
cd myapp
master server
```

Visit the server output URL (default http://localhost:8080 if configured) and you should see the starter page.

---

## Commands

```bash
master help                # Show help and available commands
master server              # Start the HTTP server
master new <name>          # Scaffold a new application in ./<name>
master generate controller <Name> [actions...]   # Add a controller and empty views
master generate view <Name> [actions...]         # Add a view folder and files
master generate socket <Name>                    # Add a socket file
master generate scaffold <Name>                  # Controller + routes + views + socket
```

Examples:

```bash
master generate controller Users index show new create edit update
master generate view Users index show
master generate socket Chat
```

---

## How it works

When you run `master server`, your app’s `server.js` boots the runtime from mastercontroller and wires up built-in modules:

```12:13:master/server.js
var server =  master.setupServer("http");
master.start(server);
```

The app structure follows clear layers:

- app/controllers: Controller classes with actions that return views or data.
- app/views: HTML templates rendered by controller actions.
- app/sockets: Socket handlers for realtime features.
- config/routes.js: Route declarations (the CLI can append resources here).
- config/initializers: Environment, request parsing, CORS, and MIME settings.

Controllers are simple classes with action methods:

```1:13:master/app/controllers/homeController.js
const master = require('mastercontroller');

class homeController{
  constructor(){}
  index(){
    return this.returnView();
  }
}

module.exports = homeController;
```

Record/model access is provided by masterrecord (add models in your app and require masterrecord as needed). This separation keeps HTTP/controller responsibilities distinct from data access.

---

## Project structure

```
app/
  controllers/
  views/
  sockets/
config/
  routes.js
  initializers/
public/
server.js
```

---

## Configuration

Key settings live in `config/initializers` and `config/environments`:

- `config/initializers/request.*`: Multipart/form-data parsing and upload limits.
- `config/initializers/cors.*`: Origins, methods, headers, and credentials.
- `config/initializers/mime.*`: Allowed MIME types.
- `config/environments/env.*.json`: Hostname, port, request timeout, error pages.

Set environment when starting the server:

```bash
master=development node server.js
```

---

## Cross-platform notes

The CLI uses Node’s `path.join` and `fs-extra` to work consistently across macOS, Windows, and Linux. Run commands from your app root.

---

## Contributing

PRs welcome. Please keep generators idempotent and configurations documented.

---

## License

MIT License

Copyright (c) Alexander Rich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.