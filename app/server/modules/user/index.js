/* jshint node:true */
'use strict';

var SETTINGS = require('../../config').AUTH;

var express = require('express'),
    passport = require('passport'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    flash = require('connect-flash');

// Start and export the app
var app = module.exports = express();

// Setup passport
require('./passport')(passport); // pass passport for configuration

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
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// App setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Routes
app.get('/', function (req, res, next) {
    res.render('index.ejs', {
        it: {
            user: req.user || {}
        }
    });
});

app.get('/login', function (req, res, next) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.post('/login', passport.authenticate('local-login', {
    successRedirect: './',
    failureRedirect: './login',
    failureFlash: true
}));

app.get('/signup', function (req, res, next) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: './',
    failureRedirect: './signup',
    failureFlash: true
}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function assertLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.status(503).send('Forbidden');
}
