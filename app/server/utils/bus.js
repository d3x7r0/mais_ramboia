const EventEmitter = require('events');

let instance;

class BUS extends EventEmitter {
    static getInstance() {
        if (!instance) {
            instance = new BUS();
        }

        return instance;
    }
}

BUS.TOPICS = {
    VIDEO_CHANGE: 'video_change',
    PLAYLIST_CHANGE: 'playlist_change',
    VIDEO_SKIP: 'video_skip'
};

module.exports = BUS;