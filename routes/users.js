const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const localStrategy = require('passport-local');

// controller
const users = require('../controllers/users');

// Refactored routes

// Render register page and create User post
router.route('/register')
    .get((users.renderRegister))
    .post(catchAsync(users.createUser))

// Render login page and authenticate login credentials
router.route('/login')
    .get((users.renderLogin))
    .post(passport.authenticate('local', { 
        failureFlash: true, 
        failureRedirect: '/login'}), users.loginRegisteredUser
);

// just for logout 
router.get('/logout',(users.logoutUser))

module.exports = router;

// old unrefactored codes
// render register page
// router.get('/register', (users.renderRegister))

// // submit or sign up user 
// router.post('/register', catchAsync(users.createUser))

// // render login page
// router.get('/login', (users.renderLogin))

// // route for logging in the registered credentials
// // one thing to note is that 
// router.post('/login',(passport.authenticate('local', { 
//         failureFlash: true, 
//         failureRedirect: '/login',
//         failureMessage: true,
//         keepSessionInfo: true
//     }), (users.loginRegisteredUser)
// ));

// router.get('/logout',(users.logoutUser))

