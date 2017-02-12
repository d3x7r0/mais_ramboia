const socketio = require('socket.io');

const Playlist = require('./playlist');

function start(server, options) {
    const io = socketio(server);

    // FIXME: deal with multiple rooms
    const pl = Playlist.getInstance();

    pl.on('playlist_change', function (video) {
        if (video) {
            emitPlaylistAdd(io, video);
        } else {
            emitPlaylistChange(io, pl);
        }
    });

    pl.on('video_change', function (video) {
        emitVideoChange(io, video);
    });

    emitPlaylistChange(io, pl);
    emitVideoChange(io, pl.getCurrent());

    return io;
}

function emitPlaylistChange(target, pl) {
    target.emit('playlist_change', {
        serverTime: +new Date(),
        currentEntry: pl.getCurrent(),
        entries: pl.getEntries()
    });
}

function emitPlaylistAdd(target, entry) {
    target.emit('playlist_add', {
        serverTime: +new Date(),
        entry: entry
    });
}

function emitVideoChange(target, entry) {
    target.emit('video_change', {
        serverTime: +new Date(),
        currentEntry: entry
    });
}

module.exports = {
    start: start
};