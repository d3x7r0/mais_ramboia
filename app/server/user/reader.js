var SETTINGS = require('../config').auth;

var cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session');

module.exports = function (app) {
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(session({
        secret: SETTINGS.session.secret,
        resave: true,
        saveUninitialized: true
    }));
};