const mongoose = require('mongoose');

const testDetails = mongoose.Schema({
    date: {type: String, required: false},
   testName: {type: String, required: true},
   marks: {type: String, required:false},
});

module.exports = mongoose.model('TestDetails', testDetails);