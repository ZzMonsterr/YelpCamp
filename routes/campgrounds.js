const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
var multer  = require('multer');
const { storage } = require("../cloudinary");
var upload = multer({ storage });

// ============================================================
// Fancier routers (use Express router.route())
// ============================================================
router.route('/')
    // show all campgrounds
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

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