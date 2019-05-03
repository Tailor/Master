let master = require('mastercontroller');

class AddControllerNameHereController{

  constructor() {
		// this.beforeAction(["Index" , "Show", "New", "Edit", "Create", "Update", Delete], function(){});
	}
  
   // GET /<add_name>
	async Index(params){
    return this.returnView();
  }
  
  // GET /<add_name>/1
  async Show(params){
    return this.returnView();
  }

  // GET /<add_name>/new
  async New(params){
    return this.returnView();
  }

  // GET /<add_name>/1/edit
  async Edit(params){
    return this.returnView();
  }

  // POST /<add_name>
  async Create(params){
    return this.returnView();
  }

  // PUT /<add_name>/1
  async Update(params){
    return this.returnView();
  }

  // DELETE /<add_name>/1
  async Destroy(params){
    return this.returnView();
  }

}

module.exports = AddControllerNameHereController;
