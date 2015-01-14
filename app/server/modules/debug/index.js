'use strict';

var SETTINGS = require('../../config').AUTH;

var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session');

// Start the app
var app = express();

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

// View setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Routes
app.get('/user', function(req, res) {
    if (!req.user) {
        res.status(404).send("No User");
    } else {
        res.status(200).send(req.user);
    }
});

// Export
module.exports = function(path, server) {
    return app;
};