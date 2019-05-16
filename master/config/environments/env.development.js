// options.memory: open an in-memory database, rather than a disk-bound one (default: false).

// options.readonly: open the database connection in readonly mode (default: false).

// options.fileMustExist: if the database does not exist, an Error will be thrown instead of creating a new file. This option does not affect in-memory or readonly database connections (default: false).

// options.timeout: the number of milliseconds to wait when executing queries on a locked database, before throwing a SQLITE_BUSY error (default: 5000).

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