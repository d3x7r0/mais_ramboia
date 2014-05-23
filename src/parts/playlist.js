/* jshint node:true */
'use strict';

var cloak = require('cloak'),
    users = require('./users');

var providers = [
    require('../providers/youtube')
];

var storage = {},
    timers = {};

var TIMEOUT = 2 * 60 * 1000;

function getPlaylist(room) {
    return _getPlaylist(room).slice(0);
}

function _getPlaylist(room) {
    storage[room.id] = storage[room.id] || [];

    return storage[room.id];
}

function parse(room, entry) {
    for (var i = 0; i < providers.length; i++) {
        var id = providers[i].parse(entry.msg);

        if (id) {
            var next = _getPlaylist(room);
            next = next[0] || {};

            if (next.id != id) {
                providers[i].process(id, afterProcess(room, entry));
            }
        }
    }
}

function afterProcess(room, entry) {
    return function (err, data) {
        if (err || !data) {
            console.log("Error processing video with id", err);
            return;
        }

        var playlist = _getPlaylist(room);

        data.user = entry.usr.name;

        playlist.push(data);

        notifyPlaylistChange(room);

        if (playlist.length === 1) {
            // First video, start the clock!
            start(room);
        }
    }
}

function start(room) {
    var playlist = _getPlaylist(room);

    if (playlist.length > 0) {
        var video = playlist[0],
            time = TIMEOUT;

        // Mark the start time of the video (for sync)
        video.timestamp = +(new Date());

        notifyVideoChanged(room, video);

        if (video.duration && !isNaN(parseInt(video.duration, 10))) {
            time = parseInt(video.duration, 10);
        }

        // Clear the timer just in case
        clearTimeout(timers[room.id]);

        // Start the timer for the next video
        // TODO LN: replace timeouts with a loop that checks every X ms (to reduce sync errors)
        timers[room.id] = setTimeout(nextVideo, time, room);
    } else {
        notifyVideoChanged(room, {});
    }
}

function nextVideo(room) {
    var playlist = _getPlaylist(room);

    clearTimeout(timers[room.id]);

    // Reset votes
    _getVotes(room).length = 0;

    if (playlist.length > 0) {
        playlist.shift();

        start(room);
    }

    notifyPlaylistChange(room);
}

function notifyVideoChanged(room, video) {
    console.log("Sending new video to room %s", room.name, video);
    room.messageMembers('video', video);
}

function notifyPlaylistChange(room) {
    var playlist = _getPlaylist(room);
    console.log("Sending new playlist to room %s", room.name, playlist);
    room.messageMembers('playlist', playlist);
}

var _votes = {};

function _getVotes(room) {
    _votes[room.id] = _votes[room.id] || [];

    return _votes[room.id];
}

function voteToSkip(room, usr, cb) {
    if (_getPlaylist(room).length === 0) {
        cb("NO_VIDEO");
        return;
    }

    var user = users.getUserByConnection(room, usr.id),
        votes = _getVotes(room);

    if (votes.indexOf(user.id) === -1) {
        votes.push(user.id);

        console.log("User \"%s\" (id: %s) voted to skip video", usr.name, user.id);

        cb();

        recalculateVotes(room, usr);
    } else {
        cb("DUPLICATE_VOTE");
    }
}

function recalculateVotes(room, usr) {
    var ids = _getUsers(room),
        votes = _getVotes(room);

    votes = votes.filter(function (id) {
        return ids.indexOf(id) !== -1;
    });

    if (votes.length > 0 && votes.length + 1 >= (ids.length / 2)) {
        console.log("Video will be skipped by majority vote");
        nextVideo(room);
    }
}

function _getUsers(room) {
    return users.getUsers(room).map(function(entry) {
        return entry.id
    });
}

module.exports = {
    get: getPlaylist,
    parse: parse,
    voteToSkip: voteToSkip,
    recalculateVotes: recalculateVotes
};
