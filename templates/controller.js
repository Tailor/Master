let master = require('mastercontroller');

class AddControllerNameHereController{

  constructor() {
		// this.beforeAction(["Index" , "Show", "New", "Edit", "Create", "Update", Delete], function(){});
	}
  
   // GET /<add_name>
	async index(params){
    return this.returnView();
  }
  
  // GET /<add_name>/1
  async show(params){
    return this.returnView();
  }

  // GET /<add_name>/new
  async new(params){
    return this.returnView();
  }

  // GET /<add_name>/1/edit
  async edit(params){
    return this.returnView();
  }

  // POST /<add_name>
  async create(params){
    return this.returnView("views/AddControllerNameHere/index.html");
  }

  // PUT /<add_name>/1
  async update(params){
    return this.returnView();
  }

  // DELETE /<add_name>/1
  async destroy(params){
    return this.returnView();
  }

}

module.exports = AddControllerNameHereController;
