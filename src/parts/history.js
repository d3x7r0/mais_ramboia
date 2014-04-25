/* jshint node:true */
'use strict';

var SETTINGS = require(__dirname + '/../../config');

var Storage = {};

function getAll(room) {
    return (Storage[room.id] || []).slice(0);
}

function store(room, usr, msg, system) {
    Storage[room.id] = Storage[room.id] || [];

    var data = {
        system: system,
        date: new Date(),
        usr: {
            id: usr.id,
            name: usr.name
        },
        msg: msg
    };

    Storage[room.id].unshift(data);

    if (Storage[room.id].length > SETTINGS.MAX_ENTRIES) {
        Storage[room.id].length = SETTINGS.MAX_ENTRIES
    }

    return data;
}

function send(room, usr, msg, system) {
    var entry = store(room, usr, msg, system);

    room.messageMembers('chat', [ entry ]);

    return entry;
}

module.exports = {
    getAll: getAll,
    store: store,
    send: send
};
