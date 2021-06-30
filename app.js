if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// console.log(process.env.SECRET)
console.log(process.env.API_KEY)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');  // A new EJS tool for layouts: ejs-mate: https://github.com/JacksonTian/ejs-mate
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');   // https://helmetjs.github.io/
const User = require('./models/user');
const MongoStore = require("connect-mongo");

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
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
// deal with illegal mongo request
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbebettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600 // time period in seconds, ref https://github.com/jdesboeufs/connect-mongo
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {             // in order to use express-session
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,    // only work via httpSecure
        // expires one week later
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))     // in order to use connect-flash
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgn9e6s5a/", // dgn9e6s5a := MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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
// also, check whether any user logged in.
app.use((req, res, next) => {
    // req.originalUrl: store the whole url user is visiting, and then
    // use it after a user has logged in (to get better user experience)
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
        console.log(req.session.returnTo);
    }
    
    // otherwise, the user does come from login('/login') or homepage('/'),
    // redirect to localhost:3000/campgrounds as default per /routes/users.js
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


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
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});