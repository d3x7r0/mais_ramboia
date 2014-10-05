'use strict';

var SETTINGS = require('../../config');

var socket = require('socket.io');

function onSocketConnected(socket) {
    console.log("Socket connected");
}

module.exports = function(path, server) {
    var io = socket(server, {
        path: path
    });

    io.on('connect', onSocketConnected);
};