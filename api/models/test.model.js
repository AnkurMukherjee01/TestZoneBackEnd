const mongoose = require('mongoose');
const testDetails = mongoose.Schema({
    question: {type: String, required: false},
    answer: {type: String, required: false},
   options: [String],
   comments:{type:String,required:false},
   image: {type: Buffer, required:false},
});

const test = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   testName: {type: String, required: true},
   testType: {type: String, required: true},
   testDuration: {type: String, required:false},
   noOfQstn:{type:Number,required:false},
   tests:[testDetails]
});

module.exports = mongoose.model('Test', test);
//module.exports = mongoose.model('TestDetails', testDetails);