/* jshint node:true */
'use strict';

var express = require('express');

// Start and export the app
var app = module.exports = express();

app.get('/users', function(req, res, next) {
    res.send('Hello, world');
});
