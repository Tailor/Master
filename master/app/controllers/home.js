var master = require('mastercontroller');

class homeController{

	constructor() {
		// can have multibale beforeaction
		// this.beforeAction(["create","index" ,"show", "edit", "new"], function(){ });
    }

    index(){
        return this.returnView();
    }
}

module.exports = homeController;