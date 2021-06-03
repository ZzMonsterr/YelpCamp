const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');

const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

// ============================================================
// Fancier routers (use Express router.route())
// ============================================================
router.route('/')
    // show all campgrounds
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // show a campground
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, validateCampground, catchAsync(campgrounds.updateCampground))
    // delete a campground
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


// ============================================================
// Original routers
// ============================================================

// show all campgrounds
// router.get('/', catchAsync(campgrounds.index));

// create a new campgrounds
// /new must be before /:id, otherwise it'll be treated as id!
// router.get('/new', isLoggedIn, campgrounds.renderNewForm);
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// show a campground
// router.get('/:id', catchAsync(campgrounds.showCampground));

// edit a campground
// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
// router.put('/:id', isLoggedIn, validateCampground, catchAsync(campgrounds.updateCampground));

// delete a campground
// router.delete('/:id', isLoggedIn, catchAsync(campgrounds.deleteCampground));

module.exports = router;