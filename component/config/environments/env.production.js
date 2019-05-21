var master = require('mastercontroller');

module.exports = { 
    //  setup my module apps that load
    http : '127.0.0.1',
    httpPort : 8080,
    requestTimeout : 60000,
    error : {
        '404': '404.html',
        '500': '500.html'
    },
    publicfolder : "public",
    database : {
        type: "better-sqlite3",
        connection : master.root + "/db/",
        password: "",
        username: ""
    }
}