const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');

const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// show all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

// create a new campgrounds
// /new must be before /:id, otherwise it'll be treated as id!
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // validation is realized in the middleware 'validateCampground'
    // create new model
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    // save it
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    // redirect to its particular camp page, also avoid user's resubmit
    res.redirect(`/campgrounds/${campground._id}`) 
}));

// show a campground
router.get('/:id', catchAsync(async (req, res,) => {
    // bug1: .populate() should be just after .findById
    // populate each review, and then populate the review's author;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');  // and then populate the campground's author
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }
    console.log(campground);
    res.render('campgrounds/show', { campground });
}));

// edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // validation is realized in the middleware 'validateCampground'
    const { id } = req.params;
    // use method-override to fake update (put) from post; ... is to spread variables
    // 'campground' is a group, detailed in /campgrounds/new.ejs
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated a new campground!');
    res.redirect(`/campgrounds/${id}`)
}));

// delete a campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;