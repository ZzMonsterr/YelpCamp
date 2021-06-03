
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
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
}

module.exports.deleteReview = async (req, res) => {
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
}