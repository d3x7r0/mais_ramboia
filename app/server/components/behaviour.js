const Playlist = require('./playlist');

const BUS = require('../utils/bus');

// video providers
const PROVIDERS = [
    require("../providers/youtube")
];

// TODO: allow multiple playlist instances
function start(options) {
    const pl = Playlist.getInstance();

    pl.on(Playlist.TOPICS.VIDEO_SKIP, function (skippedEntry, votes) {
        // Simply re-emit the event
        BUS.getInstance().emit(BUS.TOPICS.VIDEO_SKIP, skippedEntry, votes);
    });

    pl.on(Playlist.TOPICS.PLAYLIST_CHANGE, function (currentEntry) {
        // TODO: omit the event if the playlist would be empty. Let the related entry do the notification

        // Simply re-emit the event
        BUS.getInstance().emit(BUS.TOPICS.PLAYLIST_CHANGE, currentEntry);
    });

    pl.on(Playlist.TOPICS.VIDEO_CHANGE, function (currentEntry, previousEntry) {
        // TODO: get a related video if the queue is now empty

        BUS.getInstance().emit(BUS.TOPICS.VIDEO_CHANGE, currentEntry, previousEntry);
    });
}

function addVideo(provider, message) {
    const pl = Playlist.getInstance();

    return provider.process(message)
        .then(addVideoToPlaylist(pl, message));
}

function voteToSkip(user) {
    const pl = Playlist.getInstance();

    return pl.voteToSkip(user);
}

function randomVideo(message) {
    // Search the first provider for a random video
    const provider = PROVIDERS[0];

    if (!provider) {
        console.error("No provider available. Aborting");
        throw new Error("ProviderUnavailable");
    }

    const pl = Playlist.getInstance();

    const blacklist = pl.getEntries().map(entry => entry.video.id);

    return provider
        .random(message, blacklist)
        .then(addVideoToPlaylist(pl, message));
}

function addVideoToPlaylist(pl, message) {
    return video => pl.addVideo(message && message.user, video);
}

function getEntries() {
    return Playlist.getInstance().getEntries();
}

function getCurrent() {
    return Playlist.getInstance().getCurrent();
}

function getVotes() {
    return Playlist.getInstance().getVotes();
}

module.exports = {
    start: start,
    addVideo: addVideo,
    voteToSkip: voteToSkip,
    randomVideo: randomVideo,
    getEntries: getEntries,
    getCurrent: getCurrent,
    getVotes: getVotes,
    getProviders: () => PROVIDERS
};