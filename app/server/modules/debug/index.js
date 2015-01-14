'use strict';

var express = require('express');

// Start the app
var app = express();

// Setup middleware
require('../../user/reader')(app);

// View setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Routes
app.get('/user', function (req, res) {
    if (!req.user) {
        res.status(404).send("No User");
    } else {
        res.status(200).send(req.user);
    }
});

// Export
module.exports = function (path, server) {
    return app;
};