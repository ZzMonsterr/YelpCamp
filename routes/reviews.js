const express = require('express');
// set mergeParams to be True, as express.Router's default set is to
// take params separately
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

// .. means go out of /routes folder
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// create a review of one campground
// Target: POST /campgrounds/:id/reviews
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // send flash message
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review of one campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    // find that campground, delete that specific review
    // use '$pull' operator in Mongo which removes/pulls out from an existing array all
    // instances of value(s) that match a specific condition

    // About why we use 'id' here to represent the campground id:
    // we specify :id in the route path then we must access it via the
    // req.params.id property specifically.
    // In the app.js code, we define the '/campgrounds/:id/reviews' prefix
    // for all reviews routes (via typing 'app.use('/campgrounds/:id/reviews', reviews)')
    // when including the reviews routes in your app.
    // so the full route will be: /campgrounds/:id/reviews/:reviewId
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    // send flash message
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;