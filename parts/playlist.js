/* jshint node:true */
'use strict';

var cloak = require('cloak');

var providers = [
    require('../providers/youtube')
];

var storage = {},
    timers = {};

var TIMEOUT = 2 * 60 * 1000;

function getPlaylist(room) {
    storage[room.id] = storage[room.id] || [];

    return storage[room.id].slice(0);
}

function parse(room, entry) {
    for (var i = 0; i < providers.length; i++) {
        var id = providers[i].parse(entry.msg);

        if (id) {
            var next = storage[room.id] || [];
            next = next[0] || {};

            if (next.id != id) {
                providers[i].process(id, afterProcess(room, id));
            }
        }
    }
}

function afterProcess(room, id) {
    return function (err, data) {
        if (err) {
            console.log("Error processing video with id %s", id, err);
            return;
        }

        storage[room.id] = storage[room.id] || [];

        storage[room.id].push(data);

        notifyPlaylistChange(room);

        if (storage[room.id].length === 1) {
            // First video, start the clock!
            start(room);
        }
    }
}

function start(room) {
    var playlist = storage[room.id] || [];

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
    }
}

function nextVideo(room) {
    var playlist = storage[room.id] || [];

    clearTimeout(timers[room.id]);

    if (playlist.length > 0) {
        playlist.shift();

        notifyPlaylistChange(room);

        start(room);
    }
}

function notifyVideoChanged(room, video) {
    console.log("Sending new video to room %s", room.name, video);
    room.messageMembers('video', video);
}

function notifyPlaylistChange(room) {
    var playlist = storage[room.id];
    console.log("Sending new playlist to room %s", room.name, playlist);
    room.messageMembers('playlist', playlist);
}

module.exports = {
    get: getPlaylist,
    parse: parse
};
