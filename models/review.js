const mongoose = require('mongoose');
// shorten the call for mongoose.Schema
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    // bug0: String, not string. Uppercase at the beginning!
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviewSchema);