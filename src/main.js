/* jshint node:true */
// Ramboia server
"use strict";

var express = require('express'),
    logfmt = require('logfmt'),
    cloak = require('cloak');

var SETTINGS = require(__dirname + '/../config');

function init() {
    /*
     * Express
     */
    var app = express();

    app.use(logfmt.requestLogger());
    app.set('trust proxy', SETTINGS.REVERSE_PROXY_MODE);

    // Settings
    app.get('/api/settings', function (req, res, next) {
        var clientSettings = {
            PORT: SETTINGS.PORT
        };

        res.send(clientSettings);
    });

    // LESS
    app.use('/css/', require('express-less')(SETTINGS.DIR.LESS, { compress: true }));

    // Bower
    app.use('/vendor/', express.static(SETTINGS.DIR.BOWER));

    // Static
    app.use(express.static(SETTINGS.DIR.STATIC));

    // 404
    app.use(function (req, res, next) {
        res.send(404, 'Not Found');
    });

    var server = app.listen(SETTINGS.PORT, function () {
        console.info('client listening on port %d', SETTINGS.PORT);
    });

    /*
     * Cloak
     */
    cloak.configure({
        express: server,
        messages: require('./parts/messages'),
        room: require('./parts/room'),
        lobby: require('./parts/room')
    });

    cloak.run();
}

module.exports = {
    init: init
};
