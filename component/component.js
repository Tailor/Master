
var master = require('mastercontroller');

module.exports = function(requestObject) {
    
    master.masterRoot = requestObject.masterRoot;
    master.root = requestObject.root;
    master.require(["MasterError", "MasterTools", "MasterRouter", "MasterView", "MasterHtml", "MasterTemp" , "MasterAction", "MasterActionFilters", "MasterSocket", "MasterJWT", "MasterSession"]);
    require('./config/routes');
    require("./config/initializers/config");
    require("./config/load")(requestObject);
    
}
  
  