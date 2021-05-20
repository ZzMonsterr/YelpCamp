const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    // one to many relationship
    // stores a list of ObjectIds, and ref to a 'Review' model
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// middleware for one campground deletion: delete all its reviews first
// don't worry, we'll have access to what's just been deleted called 'doc'
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    // console.log(doc)
    // if something is found and deleted
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);