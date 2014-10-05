/* jshint node:true */
'use strict';

var SETTINGS = require(__dirname + '/config');

var fs = require('fs');

var express = require('express'),
    http = require('http');

var logfmt = require('logfmt'),
    session = require('express-session');

var app = express(),
    server = http.Server(app);

// Middleware
app.use(logfmt.requestLogger());
app.use(session({
    secret: SETTINGS.AUTH.SESSION.SECRET,
    resave: true,
    saveUninitialized: true
}));

// Work with reverse proxies
app.set('trust proxy', SETTINGS.REVERSE_PROXY_MODE);

// View engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Static files
// TODO LN: add build steps to build less files, concat and minify css and js
app.use(express.static(SETTINGS.DIR.CLIENT));

// Modules
function getModules(DIR) {
    return fs.readdirSync(DIR).filter(function (entry) {
        return fs.statSync(DIR + '/' + entry).isDirectory();
    });
}

var MODULE_DIR = './modules/',
    MODULES = getModules(MODULE_DIR);

MODULES.forEach(function loadModule(moduleName) {
    var path,module;

    path = '/' + moduleName;

    module = require(MODULE_DIR + moduleName)(path, server);

    if (module) {
        app.use(path, module);
    }
});

// Error Handler
var errorHandler = require('./errorHandler');
app.use(errorHandler);
app.use(errorHandler.notFound);

// Run the server
server.listen(SETTINGS.PORT, function onServerStarted() {
    console.log("Server listening on port %d", SETTINGS.PORT);
});
