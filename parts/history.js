/* jshint node:true */
'use strict';

var SETTINGS = require('../config');

var Storage = {};

function getAll(room) {
    return (Storage[room] || []).slice(0);
}

function store(room, usr, msg, date) {
    Storage[room] = Storage[room] || [];

    var data = {
        date: date || new Date(),
        usr: {
            id: usr.id,
            name: usr.name
        },
        msg: msg
    };

    Storage[room].unshift(data);

    if (Storage[room].length > SETTINGS.MAX_ENTRIES) {
        Storage[room].length = SETTINGS.MAX_ENTRIES
    }

    return data;
}

module.exports = {
    getAll: getAll,
    store: store
};