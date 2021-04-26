const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// A new EJS tool for layouts: ejs-mate: https://github.com/JacksonTian/ejs-mate
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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
app.post('/campgrounds', async (req, res) => {
    // create new model
    const campground = new Campground(req.body.campground);
    // save it
    await campground.save();
    // redirect to its particular camp page, also avoid user's resubmit
    res.redirect(`/campgrounds/${campground._id}`)
})

// show a specific campground
app.get('/campgrounds/:id', async (req, res,) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
});

// edit a specific campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
})
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    // use method-override to fake update (put) from post; ... is to spread variables
    // 'campground' is a group, detailed in /campgrounds/new.ejs
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});

// delete a specific campground
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


// opening port
app.listen(3000, () => {
    console.log('Serving on port 3000')
})