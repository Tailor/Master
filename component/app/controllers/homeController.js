const master = require('mastercontroller');

class homeController{

	constructor() {
		// can have multiple beforeAction calls
		// this.beforeAction(["create","index" ,"show", "edit", "new"], function(){ });
    }

    index(){
        return this.returnView();
    }
}

module.exports = homeController;