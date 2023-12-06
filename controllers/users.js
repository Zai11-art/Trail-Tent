const User = require('../models/user');
const passport = require('passport');
const localStrategy = require('passport-local');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};

module.exports.createUser = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) {
                return next();
            }
            req.flash('success', 'Welcome to TrailTent');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

module.exports.loginRegisteredUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
    req.logout(function(err){
        if  (err) {
            return next(err);
        }
        req.flash('success', 'Logged Out Successfuly');
        res.redirect('/campgrounds');
})}