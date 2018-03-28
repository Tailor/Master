
var mongoose = require('mongoose');

var Model = new mongoose.Schema({
  	  title : String,
      description:String,
      user_id : String,
      status : Number,
    	is_archived : {
    	  type: Boolean,
    	  default : false
    	},
      general_access_code : String,
      is_private : {
        type: Boolean,
        default : true
      },
      post : [{
        user_id : Number,
        post :  String
      }],
      subscribers : [{
        email : String
      }],
      members : [{
        email : String,
        access_code: String,
        user_id : Number,
        invited : String
      }]
});


// on every save, add the date
Model.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

module.exports = mongoose.model('Boards', Model);


// This is working

// var Model = new mongoose.Schema({ date : String });

// module.exports = mongoose.model('Model', Model);