
var master = require('mastercontroller');

module.exports = function(component) {
    master.masterRoot = component.masterRoot;
    master.root = component.root;
    master.require(["MasterError", "MasterTools", "MasterRouter", "MasterView", "MasterHtml", "MasterTemp" , "MasterAction", "MasterActionFilters", "MasterSocket", "MasterJWT", "MasterSession"]);
    require('./config/routes');
    require("./config/initializers/config");
    require("./config/load")(component);
}
  