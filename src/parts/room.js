/* jshint nodejs:true */

var history = require('./history'),
    playlist = require('./playlist'),
    users = require('./users');

var _ = require('underscore');

var TIMEOUT = 300;

var timers = {};

var memberLeaves = function memberLeaves(usr) {
    var room = this;

    history.send(room, usr, 'has left the room', true);

    timers[usr.id] = setTimeout(playlist.recalculateVotes, TIMEOUT, room, usr);

    users.removeConnection(room, usr.id);

    console.log(users.getUsers(room));
};

var newMember = function newMember(usr) {
    clearTimeout(timers[usr.id]);
};

module.exports = {
    newMember: newMember,
    memberLeaves: memberLeaves
};
