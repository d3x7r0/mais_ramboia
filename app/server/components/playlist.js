const EventEmitter = require('events');

const SETTINGS = require('../config');

const DEFAULT_INSTANCE_ID = "_";

const PLAYLISTS = [];

class Playlist extends EventEmitter {
    constructor(id) {
        super();

        this.id = id;

        this.entries = [];
        this.votes = [];
        this.currentEntry = undefined;
        this.timer = undefined;
    }

    addVideo(user, video) {
        let last = this.entries[this.entries.length - 1];

        if (last && last.video.id === video.id) {
            // Reject video if it's a duplicate
            return false;
        }

        if (video.isLive === true) {
            // Reject video if it's a live stream
            return false;
        }

        if (video.duration <= SETTINGS['playlist']['minDuration']) {
            // Reject video if it's too short
            return false;
        }

        this.entries.push({
            user: user,
            video: video
        });

        if (this.entries.length === 1) {
            // set the timer
            this.start()
        }

        this.notifyPlaylistChange(
            this.entries[this.entries.length - 1]
        );

        return true;
    }

    voteToSkip(userID) {
        if (!this.currentEntry) {
            return false;
        }

        if (this.votes.indexOf(userID) === -1) {
            this.votes.push(userID);

            console.info("User %s voted to skip the current video", userID, this.currentEntry);

            this.tallyVotes();
            return true;
        } else {
            return false;
        }
    }

    tallyVotes() {
        if (this.votes.length >= SETTINGS['playlist']['votes']) {
            console.info("Users have voted to skip", this.votes);

            this.notifyVideoSkipped(this.currentEntry, this.votes);
            this.nextVideo();
        }
    }

    start() {
        // Clear the timer just in case
        clearTimeout(this.timer);

        if (this.entries.length > 0) {
            let entry = this.entries[0],
                time;

            // Mark the start time of the video (for sync)
            entry.timestamp = +(new Date());

            time = entry.video.duration * 1000; // seconds to millis

            this.notifyVideoChanged(entry);
            this.currentEntry = entry;

            // Start the timer for the next video
            // TODO LN: replace timeouts with a loop that checks every X ms (to reduce sync errors)
            this.timer = setTimeout(this.nextVideo.bind(this), time);
        } else {
            this.notifyVideoChanged();
        }
    }

    nextVideo() {
        clearTimeout(this.timer);

        this.votes = [];
        this.currentEntry = undefined;

        if (this.entries.length > 0) {
            this.entries.shift();

            this.start();
        }

        this.notifyPlaylistChange();
    }

    notifyVideoChanged(video) {
        console.info("Sending new video to room", video);

        this.emit('video_change', video);
    }

    notifyPlaylistChange(entry) {
        console.info("Sending new playlist to room", this.entries);

        this.emit('playlist_change', entry);
    }

    notifyVideoSkipped(video, votes) {
        console.info("Video was skipped", video, votes);

        this.emit('video_skip', video, votes);
    }

    getCurrent() {
        return this.currentEntry || null;
    }

    getEntries() {
        return this.entries.slice(0);
    }

    getVotes() {
        return this.votes.slice(0);
    }

    static getInstance(id) {
        // TODO: validate id when multi-room is supported
        // if (!id) {
        //     throw new Error("Missing id");
        // }

        id = id || DEFAULT_INSTANCE_ID;

        PLAYLISTS[id] = PLAYLISTS[id] || new Playlist(id);

        return PLAYLISTS[id];
    }
}

module.exports = Playlist;
