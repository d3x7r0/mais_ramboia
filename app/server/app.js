'use strict';

const SETTINGS = require(__dirname + '/config');

const express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    logfmt = require('logfmt');

const app = express(),
    server = http.Server(app),
    io = require('socket.io')(server);

// Middleware
app.use(logfmt.requestLogger());
app.use(bodyParser.urlencoded({extended: true}));

// Work with reverse proxies
app.set('trust proxy', SETTINGS.reverseProxyMode);

// Static files
app.use(express.static(SETTINGS.dir.client));

// Routes
const statusHandler = require('./statusHandler');

app.get('/status', function (req, res) {
    const status = statusHandler.getStatus();

    if (status.isHealthy) {
        res.status(200).send(status);
    } else {
        res.status(500).send(status);
    }
});

// Socket.IO
io.on('connection', function (socket) {
    console.log('a user connected');
});

// Slack bot
const bot = require('./components/slack');
bot.start(app, SETTINGS);

// Error Handler
const errorHandler = require('./errorHandler');
app.use(errorHandler);
app.use(errorHandler.notFound);

// Run the server
server.listen(SETTINGS.port, function onServerStarted() {
    console.log("Server listening on port %d", SETTINGS.port);
});
