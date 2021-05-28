const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');

const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');

// validate
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

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
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // validation is realized in the middleware 'validateCampground'
    // create new model
    const campground = new Campground(req.body.campground);
    // save it
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    // redirect to its particular camp page, also avoid user's resubmit
    res.redirect(`/campgrounds/${campground._id}`) 
}));

// show a campground
router.get('/:id', isLoggedIn, catchAsync(async (req, res,) => {
    // bug1: .populate() should be just after .findById
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }
    console.log(campground);
    res.render('campgrounds/show', { campground });
}));

// edit a campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    // validation is realized in the middleware 'validateCampground'
    const { id } = req.params;
    // use method-override to fake update (put) from post; ... is to spread variables
    // 'campground' is a group, detailed in /campgrounds/new.ejs
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete a campground
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;