/* jshint node:true */

var history = require('./history');

function name(name, usr) {
    if (name && name.length > 1) {
        usr.name = name;
    }

    usr.message('name', usr.name);
}

function chat(msg, usr) {
    var entry = history.store(usr.getRoom(), usr, msg);

    usr.getRoom().messageMembers('chat', [ entry ]);
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