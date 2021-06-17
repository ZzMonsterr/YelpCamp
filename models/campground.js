const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user')
const Schema = mongoose.Schema;

// https://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/r_max/c_scale,w_200/lady.jpg

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// ref https://mongoosejs.com/docs/tutorials/virtuals.html#virtuals-in-json
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    // geocoding ref: https://mongoosejs.com/docs/geojson.html
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // [] := one to many relationship, stores a list of ObjectIds, and ref to a 'Review' model
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// create a virtual property, not stored in the database but only used once
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    // this := refer to the specific campground
    // line 1: display the campground's name
    // line 2: display first 20 letters of campground's description
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
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