module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user);  // thanks to passport, user's info is stored in session!
    if (!req.isAuthenticated()) {
        // req.originalUrl: store the whole url user is visiting, and then
        // use it after a user has logged in (to get better user experience)
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}