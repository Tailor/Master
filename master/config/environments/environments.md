    "server": {
        "hostname" : "localhost" or "127.0.0.1", --- setup your servers hostname you want to use 
        "httpPort" : 8080, --- setup your severs http port
        "requestTimeout" : 60000 --- setup server timeout time
    },
    "error" : { --- error code list and the location of the file you want to show for the certain error code
        "404": "/public/404.html", --- 404 error location page
        "500": "/public/500.html" --- 500 error location page
    }