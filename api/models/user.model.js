const mongoose = require('mongoose');
const answer = mongoose.Schema({
question:{type:String,required:true},
answer :  {type:String,required:true},
qstnId:{type:String,required:true}
});

const testDetails = mongoose.Schema({
    assigneddate:{type:Date,required:true},
    date: {type: Date, required: false},
   testName: {type: String, required: true},
   duration:{type:String,required:false},
   timeStarted:{type:Date,required:false},
    answers:[answer],
   marks: {type: String, required:false},
});

const user = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   email: {type: String, required: true},
   password: {type: String, required: true},
   firstName: {type: String, required:false},
   lastName: {type: String , required:false},
   isadmin:{type:Boolean,required:true},
   approval:{type:String,required:false},
   passChange:{type:Boolean,required:false},
   batchName:{type:String,required:false},
   lastLogin:{type:Date,required:false},
   tests:[testDetails]
});

module.exports = mongoose.model('User', user);