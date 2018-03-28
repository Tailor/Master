var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var board_tags = new Schema({
      _id : Schema.Types.ObjectId,
    	name : {
    	  type: String
    	},
      color: { 
      	type: String
      },
      count : {
      	type: Number
      },
      board_id : {
      	type: Number
      }
});


// on every save, add the date
board_tags.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});


module.exports = mongoose.model('board_tags', board_tags);