'use strict';

var SETTINGS = require('../config').AUTH;

var express = require('express'),
    passport = require('passport'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    flash = require('connect-flash');

// Start the app
var app = express();

// Setup passport
require('./passport/google')(passport); // pass passport for configuration

// Setup middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: SETTINGS.SESSION.SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// View setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Routes
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Google
app.get('/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

// the callback after google has authenticated the user
app.get('/login/google', passport.authenticate('google', {
    successRedirect: '/',
    // TODO LN: failure message
    failureRedirect: '/',
    failureFlash: true
}));

// Export
module.exports = app;