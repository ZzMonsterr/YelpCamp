const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

// register a new user, and then log in automatically
router.get('/register', (req, res) => {
    // we've use viewengine and blabla in the app.js so that we can
    // avoid typing the whole path
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/register');
});
router.post('/register', catchAsync(async(req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // ref http://www.passportjs.org/docs/login/
        // Note: passport.authenticate() middleware invokes req.login() automatically. 
        req.login(registeredUser, function(err) {
            if (err) { return next(err); }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// log in, where authentication happens
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/login');
});
router.post('/login', passport.authenticate('local', 
            {failureFlash: true, failureRedirect: '/login'}),
            (req, res) => {
    // failureFlash:= show flash of "Password or username is incorrect" if login failed
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// log out
router.get('/logout', (req, res) => {
    req.logout();   // thanks to passport
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;