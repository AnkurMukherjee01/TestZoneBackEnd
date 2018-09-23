const mongoose = require('mongoose');
const batch = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    batchName: {type: String, required: true}
})

module.exports = mongoose.model('Batch', batch);