/* jshint node:true */

var history = require('./history'),
    playlist = require('./playlist');

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
    var entries = history.getAll(usr.getRoom());

    usr.message('chat', entries);
    usr.message('name', usr.name);
}

module.exports = {
    init: init,
    chat: chat,
    name: name
};