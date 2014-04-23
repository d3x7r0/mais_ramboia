/* jshint nodejs:true */

var playlist = require('./playlist');

var _ = require('underscore');

var TIMEOUT = 300;

var timers = {};

var memberLeaves = function memberLeaves(usr) {
    var room = this;

    timers[usr.id] = setTimeout(playlist.recalculateVotes, TIMEOUT, room, usr);
};

var newMember = function newMember(usr) {
    clearTimeout(timers[usr.id]);
};

module.exports = {
    newMember: newMember,
    memberLeaves: memberLeaves
};