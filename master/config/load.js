
var master = require('mastercontroller');

module.exports = function(params) {
	/*
  |--------------------------------------------------------------------------
  | Load The Master Application 
  |--------------------------------------------------------------------------
  |
  | Load The Master Application With Request, Response And The Directory Location. 
  | This File Will Only Get Called One Time When Application Gets Loaded.
  | **** Cors must be loaded before router *****
  |
  */
  master.cors.load(params);
  master.router.load(params);

}