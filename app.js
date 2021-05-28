const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');  // A new EJS tool for layouts: ejs-mate: https://github.com/JacksonTian/ejs-mate
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// tell the ejs to change engine to ejsMate instead of the default one
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// expand the req.body
app.use(express.urlencoded({ extended: true }));
// for update(U) and delete(D) in CRUD
app.use(methodOverride('_method'));
// serving static assets in /public; 
// use path.join here so that we can reach /public regardless of curr path
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {             // in order to use express-session
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // expires one week later
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))     // in order to use connect-flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());        // per http://www.passportjs.org/docs/downloads/html/: If your application uses persistent login sessions, passport.session() middleware must also be used.
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   // serializeUser: how do we store a user in session
passport.deserializeUser(User.deserializeUser());  // deserializeUser: unstore a user

// a middleware on EVERY single request, put before any routers,
// if any flash message of which type is 'success' is passed,
// we'll have access to it in our locals under the key success.
// In /views/layouts/boilerplate.ejs, we use <%= success %> 
// to display flash message.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// home page
app.get('/', (req, res) => {
    res.render('home')
});


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