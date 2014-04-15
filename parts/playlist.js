/* jshint node:true */
'use strict';

var cloak = require('cloak');

var providers = [
    require('../providers/youtube')
];

var storage = {},
    timers = {};

var TIMEOUT = 1000;

function getPlaylist(room) {
    return (storage[room.id] || []).slice(0);
}

function parse(room, entry) {
    for (var i = 0; i < providers.length; i++) {
        var id = providers[i].parse(entry.msg);

        if (id) {
            providers[i].process(id, afterProcess(room, id));
        }
    }

    console.log(storage[room.id]);
}

function afterProcess(room, id) {
    return function (err, data) {
        if (err) {
            console.log("Error processing video with id %s", id, err);
            return;
        }

        var playlist = getPlaylist(room);

        playlist.push(data);

        notifyPlaylistChange(room);

        if (playlist.length === 1) {
            // First video, start the clock!
            start(room);
        }
    }
}

function start(room) {
    var playlist = getPlaylist(room);

    if (playlist.length > 0) {
        var video = playlist[0],
            time = TIMEOUT;

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
    var playlist = getPlaylist(room);

    clearTimeout(timers[room.id]);

    if (playlist.length > 0) {
        playlist.pop();

        notifyPlaylistChange(room);

        start(room);
    }
}

function notifyVideoChanged(room, video) {
    room.messageMembers('video', {
        timestamp: +new Date(),
        video: video
    });
}

function notifyPlaylistChange(room) {
    room.messageMembers('playlist', storage[room.id]);
}

module.exports = {
    get: getPlaylist,
    parse: parse
};