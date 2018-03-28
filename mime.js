var app = require('mastercontroller');
var router = app.router;

// Add mime types to router
router.addMimeType({'.ico': 'image/x-icon'});
router.addMimeType({'.html': 'text/html'});
router.addMimeType({'.js': 'text/javascript'});
router.addMimeType({'.json': 'application/json'});
router.addMimeType({'.css': 'text/css'});
router.addMimeType({'.png': 'image/png'});
router.addMimeType({'.jpg': 'image/jpeg'});
router.addMimeType({'.wav': 'audio/wav'});
router.addMimeType({'.mp3': 'audio/mpeg'});
router.addMimeType({'.svg': 'image/svg+xml'});
router.addMimeType({'.pdf': 'application/pdf'});
router.addMimeType({'.doc': 'application/msword'});
router.addMimeType({'.eot': 'appliaction/vnd.ms-fontobject'});
router.addMimeType({'.ttf': 'application/octet-stream'});
router.addMimeType({'.woff': 'application/font-woff'});
router.addMimeType({'.woff2': 'application/font-woff2'});