/*
** Add on browser js file **
  var homeSocket = io.connect('http://127.0.0.1:8080', {query : "socket=home"});
  homeSocket.on('index', function(obj){});
  homedSocket.emit('index', *SEND OBJECT*);
*/

class homeSocket{

	constructor() {
		// can have multiple beforeAction calls
		// this.beforeAction(["create","index" ,"show", "edit", "new"], function(){ });
    }

    index(obj){
        
    }
}

module.exports = homeSocket;