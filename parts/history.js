/* jshint node:true */
'use strict';

var SETTINGS = require('../config');

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

module.exports = {
    getAll: getAll,
    store: store
};