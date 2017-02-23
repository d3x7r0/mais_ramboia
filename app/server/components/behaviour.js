const Playlist = require('./playlist');

const BUS = require('../utils/bus');

// video providers
const PROVIDERS = [
    require("../providers/youtube")
];

// TODO: allow multiple playlist instances
function start(options) {
    const pl = Playlist.getInstance();

    const maxRelated = parseInt(options.playlist.maxRelated, 10);

    let related = 0;

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
        // get a related video if the queue is now empty
        if (!currentEntry) {
            // TODO: cap the number of related entries
            addRelatedVideo(previousEntry).catch(err => {
                console.error("There was an error adding a related video", err);

                // Send the playlist changed notification if we couldn't add a related video
                BUS.getInstance().emit(BUS.TOPICS.VIDEO_CHANGE, currentEntry, previousEntry);
            })
        } else {
            BUS.getInstance().emit(BUS.TOPICS.VIDEO_CHANGE, currentEntry, previousEntry);
        }
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

function addRelatedVideo(previousEntry) {
    const pl = Playlist.getInstance();

    const provider = findProvider(previousEntry.video.provider);

    if (!provider) {
        throw new Error("UnknownProvider");
    }

    return provider.related(previousEntry.video.id)
        .then(addVideoToPlaylist(pl))
}

function findProvider(name) {
    return PROVIDERS.find(provider => provider.NAME === name);
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