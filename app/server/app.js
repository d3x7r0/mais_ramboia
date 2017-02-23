'use strict';

const SETTINGS = require(__dirname + '/config');

// Behaviour
const Behaviour = require('./components/behaviour');
Behaviour.start(SETTINGS);

// Web server
const express = require('express');
const app = express();
const server = require('http').Server(app);

// Middleware
app.use(require('logfmt').requestLogger());
app.use(require('body-parser').urlencoded({extended: true}));

// Work with reverse proxies
app.set('trust proxy', SETTINGS.reverseProxyMode);

// Static files
app.use(express.static(SETTINGS.dir.client));

// Routes
const rest = require('./components/rest');
rest.start(app, SETTINGS);

// Socket.IO
const io = require('./components/comms');
io.start(server, SETTINGS);

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
