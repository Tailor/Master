var master = require('mastercontroller');

class homeController{

	constructor() {
		// can have multibale beforeaction
		//this.beforeAction(["create","index" ,"show", "addVote", "getUserById"], this.auth);
    }

    index(){
        return this.returnView();
    }
}

module.exports = homeController;