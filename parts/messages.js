/* jshint node:true */

var history = require('./history'),
    playlist = require('./playlist');

var fs = require('fs');

var NAMES = [];

fs.readFile(__dirname + '/../resources/names.txt', { encoding: 'utf-8' }, function (err, data) {
    "use strict";
    if (err) {
        console.warn("Error loading list of random names", err);
    } else {
        NAMES = data && data.split('\n') || [];
    }
});

function name(name, usr) {
    if (name && name.length > 1) {
        usr.name = name;
    }

    usr.message('name', usr.name);
}

function chat(msg, usr) {
    var room = usr.getRoom(),
        entry = history.store(room, usr, msg);

    playlist.parse(room, entry);

    room.messageMembers('chat', [ entry ]);
}

function init(params, usr) {
    var entries = history.getAll(usr.getRoom()),
        pls = playlist.get(usr.getRoom());

    params = params || {};

    usr.name = params.name || _getRandomUsername();

    var data = {
        chat: entries,
        name: usr.name
    };

    if (pls.length > 0) {
        data.playlist = pls;
        data.video = pls[0];
    }

    usr.message('init', data);
}

function _getRandomUsername() {
    "use strict";

    return NAMES[Math.random() * NAMES.length | 0] || 'Nameless User';
}

module.exports = {
    init: init,
    chat: chat,
    name: name
};