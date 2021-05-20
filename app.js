const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
mongoose.set('useFindAndModify', false);
// A new EJS tool for layouts: ejs-mate: https://github.com/JacksonTian/ejs-mate
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { nextTick } = require('process');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// tell the ejs to change engine to ejsMate instead of the default one
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// expand the req.body
app.use(express.urlencoded({ extended: true }));
// for update(U) and delete(D) in CRUD
app.use(methodOverride('_method'));

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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// home page
app.get('/', (req, res) => {
    res.render('home')
});

// show all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
});

// create a new campgrounds.
// /new must be before /:id, otherwise it'll be treated as id!
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // validation is realized in the middleware 'validateCampground'

    // create new model
    const campground = new Campground(req.body.campground);
    // save it
    await campground.save();
    // redirect to its particular camp page, also avoid user's resubmit
    res.redirect(`/campgrounds/${campground._id}`) 
}));

// show a specific campground
app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
    // bug1: .populate() should be just after .findById
    const campground = await (await Campground.findById(req.params.id).populate('reviews'))
    console.log(campground);
    res.render('campgrounds/show', { campground });
}));

// edit a specific campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    // validation is realized in the middleware 'validateCampground'

    const { id } = req.params;
    // use method-override to fake update (put) from post; ... is to spread variables
    // 'campground' is a group, detailed in /campgrounds/new.ejs
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete a specific campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// create a review of one campground
// Target: POST /campgrounds/:id/reviews
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    // res.send('YOU MADE IT!!!');  // test success
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// delete a review of one campground
app.delete('/campgrounds/:campId/reviews/:reviewId', catchAsync(async (req, res) => {
    // find that campground, delete that specific review
    // use '$pull' operator in Mongo which removes/pulls out from an existing array all
    // instances of value(s) that match a specific condition
    const {campId, reviewId} = req.params;
    await Campground.findByIdAndUpdate(campId, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campId}`);
}))

// '*': catch error in all links
// IMPORTANT: this will only run if none of these previous lines matches
app.all('*', (req, res, next) => {
    // res.send('404!!!')
    // next: passing this error to next function 'app.use(...)'
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    // res.send('Ouchhhh... something went wrong!')
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});


// opening port
app.listen(3000, () => {
    console.log('Serving on port 3000')
});