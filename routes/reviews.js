const express = require('express');
const reviews = require('../controllers/reviews');
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
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// delete a review of one campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;