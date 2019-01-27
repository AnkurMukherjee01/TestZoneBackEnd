const mongoose = require('mongoose');
const student = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String, required: true},
    name: {type: String, required:false},
    createdtime:{type:Date,required:false},
    phoneNo:{type:String,required:false},
   course:{type:String,required:false},
   subject:{type:String,required:false},
    message:{type:String,required:false}
 }, { collection: 'student' });
 
 module.exports = mongoose.model('Student', student);