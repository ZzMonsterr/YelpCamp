const express = require('express');
// set mergeParams to be True, as express.Router's default set is to
// take params separately
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');

// .. means go out of /routes folder
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


// validate
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// create a review of one campground
// Target: POST /campgrounds/:id/reviews
router.post('/', validateReview, catchAsync(async (req, res) => {
    console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // send flash message
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review of one campground
router.delete('/:reviewId', catchAsync(async (req, res) => {
    // find that campground, delete that specific review
    // use '$pull' operator in Mongo which removes/pulls out from an existing array all
    // instances of value(s) that match a specific condition
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    // send flash message
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;