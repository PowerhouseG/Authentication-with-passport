var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    last_name: {type: String, required: true, maxLength: 100},
    email: {type: String,required:true,maxLength:100},
    password: {type: String,required:true},
    username:{type:String, required:true, maxLength:100},
    status:{type:String, required:true,enum:['Unverified',"Verified",'Admin'],default:'Unverified'},
  }
);

module.exports = mongoose.model('User', UserSchema);