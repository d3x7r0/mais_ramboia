'use strict';

var SETTINGS = require(__dirname + '/config');

var fs = require('fs');

var express = require('express'),
    http = require('http');

var bodyParser = require('body-parser');

var logfmt = require('logfmt');

var app = express(),
    server = http.Server(app),
    io = require('socket.io')(server);

// Middleware
app.use(logfmt.requestLogger());
app.use(bodyParser.urlencoded({extended: false}));

// Work with reverse proxies
app.set('trust proxy', SETTINGS.reverseProxyMode);

// Static files
// TODO LN: add build steps to build less files, concat and minify css and js
app.use(express.static(SETTINGS.dir.client));

// Routes
var commands = require('./commands');

app.post('/submit',
    require('./input-validator')(SETTINGS),
    function (req, res) {
        const output = commands.process(req.body);

        res.send(output);
    });


// Socket.IO
io.on('connection', function (socket) {
    console.log('a user connected');
});

// Error Handler
var errorHandler = require('./errorHandler');
app.use(errorHandler);
app.use(errorHandler.notFound);

// Run the server
server.listen(SETTINGS.port, function onServerStarted() {
    console.log("Server listening on port %d", SETTINGS.port);
});
