const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

// ============================================================
// Fancier routers (use Express router.route())
// ============================================================
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

// ============================================================
// Original routers
// ============================================================

// register a new user, and then log in automatically
// router.get('/register', users.renderRegister);
// router.post('/register', catchAsync(users.register));

// log in, where authentication happens
// router.get('/login', users.renderLogin);
// router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

// log out
router.get('/logout', users.logout);

module.exports = router;