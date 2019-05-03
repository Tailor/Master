
var master = require('mastercontroller');

module.exports = function(params) {
	/*
  |--------------------------------------------------------------------------
  | Load The Master Application 
  |--------------------------------------------------------------------------
  |
  | Load The Master Application With Request, Response And The Directory Location. 
  | 
  |
  */
 
  master.router.load(params);
}