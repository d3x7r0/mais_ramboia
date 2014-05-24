/* jshint node:true */

var history = require('./history'),
    playlist = require('./playlist'),
    users = require('./users'),
    names = require('./names');

function name(name, usr) {
    if (name && name.length > 1) {
        usr.name = name;
    }

    usr.message('name', usr.name);
}

function chat(msg, usr) {
    var room = usr.getRoom();

    var entry = history.send(room, usr, msg);

    playlist.parse(room, entry);
}

function init(params, usr) {
    var entries = history.getAll(usr.getRoom()),
        pls = playlist.get(usr.getRoom());

    params = params || {};

    if (!params.uuid) {
        // Ignore connections without uuid
        return;
    }

    users.addUser(usr.getRoom(), params.uuid, usr.id);

    usr.name = params.name || names.getRandomName();

    console.log(users.getUsers(usr.getRoom()));

    var data = {
        chat: entries,
        name: usr.name
    };

    if (pls.length > 0) {
        data.playlist = pls;
        data.video = pls[0];
    }

    usr.message('init', data);

    history.send(usr.getRoom(), usr, 'has joined the room', true);
}

function skip(params, usr) {
    var room = usr.getRoom();

    playlist.voteToSkip(room, usr, function (err) {
        usr.message('skip', err);

        history.send(room, usr, 'voted to skip', true);
    });
}

module.exports = {
    init: init,
    chat: chat,
    name: name,
    skip: skip
};
