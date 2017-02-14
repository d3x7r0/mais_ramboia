const SETTINGS = require('./config');

const Playlist = require('./components/playlist');

let HEALTHY = false;

// TODO: better status
function getStatus() {
    const pl = Playlist.getInstance();

    return {
        isHealthy: HEALTHY,
        uptime: process.uptime(),
        details: {
            serverTime: +new Date(),
            settings: getSettings(),
            playlist: {
                current: pl.getCurrent(),
                entries: pl.getEntries(),
                votes: pl.getVotes()
            }
        }
    }
}

function setHealthy(status) {
    HEALTHY = !!status;
}

const SETTINGS_TO_EXPOSE = ['slack', 'youtube', 'playlist'];
function getSettings() {
    // Copy object
    let copy = JSON.parse(JSON.stringify(SETTINGS));

    // cast keys to boolean to avoid exposing them
    copy.slack.token = !!copy.slack.token;
    copy.youtube.key = !!copy.youtube.key;

    let result = {};

    for(let key in copy) {
        if (copy.hasOwnProperty(key) && SETTINGS_TO_EXPOSE.indexOf(key) !== -1) {
            result[key] = copy[key]
        }
    }

    return result;
}

module.exports = {
    getStatus: getStatus,
    setHealthy: setHealthy
};