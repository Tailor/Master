var master = require('mastercontroller');
var masterrecord = require('masterrecord');
var jwt = require('./jwt');
var mime = require('./mime');
var sessions = require('./sessions');

/* Load dependency named ApplicationService to our application controller class.
 so that you can have access to it inside my controllers */
require(master.root + '/app/service/applicationService');

master.init(process.env.master);
master.router.mimes(mime);
master.socket.init();
master.sessions.init(sessions);
master.jwt.init(jwt);
master.error.init(master.env);
masterrecord.init(master.env);