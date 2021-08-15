
var master = require('mastercontroller');

module.exports = function(params) {
	/*
  |--------------------------------------------------------------------------
  | Load The Master Application 
  |--------------------------------------------------------------------------
  |
  | Load The Master Application With Request, Response And The Directory Location. 
  | This File Will Only Get Called One Time When Application Gets Loaded.
  |
  */
 
  master.router.load(params);
  master.cors.load(params);

}