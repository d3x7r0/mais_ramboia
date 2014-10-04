/* jshint node:true */
'use strict';

var SETTINGS = require(__dirname + '/config');

var express = require('express'),
    socket = require('socket.io'),
    logfmt = require('logfmt'),
    http = require('http');

var app = express(),
    server = http.Server(app),
    io = socket(server);

// Logger
app.use(logfmt.requestLogger());

// Work with reverse proxies
app.set('trust proxy', SETTINGS.REVERSE_PROXY_MODE);

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Static files
// TODO LN: add build steps to build less files, concat and minify css and js
app.use(express.static(SETTINGS.DIR.CLIENT));

// Modules
var MODULE_DIR = './modules/',
    MODULES = [
        'user'
    ];

MODULES.forEach(function loadModule(moduleName) {
    app.use('/' + moduleName, require(MODULE_DIR + moduleName));
});

// Socket.IO
io.on('connection', function onSocketConnected() {
    console.log("Socket connected");
});

// Error Handler
var errorHandler = require('./errorHandler');
app.use(errorHandler);
app.use(errorHandler.notFound);

// Run the server
server.listen(SETTINGS.PORT, function onServerStarted() {
    console.log("Server listening on port %d", SETTINGS.PORT);
});
