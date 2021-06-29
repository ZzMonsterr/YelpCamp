const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    // we've use viewengine and blabla in the app.js so that we can
    // avoid typing the whole path
    // if (req.isAuthenticated()) {
    //     return res.redirect('/campgrounds');
    // }
    res.render('users/register');
}

module.exports.register = async(req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // console.log("in routes/users.js, redirectUrl:", redirectUrl);
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();   // thanks to passport
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}