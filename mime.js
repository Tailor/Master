var appRouter = require('masterrouter');

// Add mime types to router
appRouter.addMimeType({'.ico': 'image/x-icon'});
appRouter.addMimeType({'.html': 'text/html'});
appRouter.addMimeType({'.js': 'text/javascript'});
appRouter.addMimeType({'.json': 'application/json'});
appRouter.addMimeType({'.css': 'text/css'});
appRouter.addMimeType({'.png': 'image/png'});
appRouter.addMimeType({'.jpg': 'image/jpeg'});
appRouter.addMimeType({'.wav': 'audio/wav'});
appRouter.addMimeType({'.mp3': 'audio/mpeg'});
appRouter.addMimeType({'.svg': 'image/svg+xml'});
appRouter.addMimeType({'.pdf': 'application/pdf'});
appRouter.addMimeType({'.doc': 'application/msword'});
appRouter.addMimeType({'.eot': 'appliaction/vnd.ms-fontobject'});
appRouter.addMimeType({'.ttf': 'application/octet-stream'});
appRouter.addMimeType({'.woff': 'application/font-woff'});
appRouter.addMimeType({'.woff2': 'application/font-woff2'});