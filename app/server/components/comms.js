const socketio = require('socket.io');

const Behaviour = require('./behaviour');

const BUS = require('../utils/bus');

function start(server, options) {
    const io = socketio(server);

    const busInstance = BUS.getInstance();

    busInstance.on(BUS.TOPICS.PLAYLIST_CHANGE, function (video) {
        if (video) {
            emitPlaylistAdd(io, video);
        } else {
            emitPlaylistChange(io, Behaviour);
        }
    });

    busInstance.on(BUS.TOPICS.VIDEO_CHANGE, function (video) {
        emitVideoChange(io, video);
    });

    emitPlaylistChange(io, Behaviour);
    emitVideoChange(io, Behaviour.getCurrent());

    return io;
}

function emitPlaylistChange(target, pl) {
    target.emit('playlist_change', {
        serverTime: Date.now(),
        currentEntry: pl.getCurrent(),
        entries: pl.getEntries()
    });
}

function emitPlaylistAdd(target, entry) {
    target.emit('playlist_add', {
        serverTime: Date.now(),
        entry: entry
    });
}

function emitVideoChange(target, entry) {
    target.emit('video_change', {
        serverTime: Date.now(),
        currentEntry: entry
    });
}

module.exports = {
    start: start
};