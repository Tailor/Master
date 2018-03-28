
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var member_permission = new Schema({
      _id : Schema.Types.ObjectId,
      board_id: { 
            type: Number
      }, 
      user_id: { 
            type: Number
      },
      show_board : {
            type: Boolean,
            default : false
      },
      show_lesson : {
            type: Boolean,
            default : false
      },
      edit_lesson : {
            type: Boolean,
            default : false
      },
      delete_lesson : {
            type: Boolean,
            default : false
      },
      read_write_comments : {
            type: Boolean,
            default : false
      },
      delete_comments : {
            type: Boolean,
            default : false
      },
      add_lesson_to_board : {
            type: Boolean,
            default : false
      },
      add_members_to_board : {
            type: Boolean,
            default : false
      },
      is_board_permission: {
            type: Boolean,
            default : false
      }

});

// on every save, add the date
member_permission.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});


module.exports = mongoose.model('member_permission', member_permission);

