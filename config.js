var app = require('mastercontroller');
var mongoose = require('mongoose');

var secret = "<ADD_SECRET_HERE>";

app.view.init();
app.control.actionFilter("auth", app.view.helpers.auth);
app.socket.init(__dirname);
app.sessions.init({ secret: secret });
app.jwt.init(secret, 'sha256');
app.error.init(process.env.NODE_ENV, __dirname);
app.http_IP = '127.0.0.1';
app.http_port = 8080;

// un comment if you want to manage environments
// switch(process.env.NODE_ENV) {
//     case 'production':
//             you can set setting for production here
//         break;
//     case 'development':
//             you can set setting for development here
//         break;

//     case 'test':
//             you can set setting for test here
//         break;
//     default:
//             you can set setting all your default settings here
//         break;
// }

app.error.httpStatus(500, "/public/500.html");
app.error.httpStatus(404, "/public/404.html");

// un comment fi you want to use Mongo DB Mongoose
//mongoose.connect('mongodb://localhost:27017/local');

