const SETTINGS = require('./config');

const Behaviour = require('./components/behaviour');

let HEALTHY = false;

// TODO: better status
function getStatus() {
    return {
        isHealthy: HEALTHY,
        uptime: process.uptime(),
        details: {
            serverTime: Date.now(),
            settings: getSettings(),
            playlist: {
                current: Behaviour.getCurrent(),
                entries: Behaviour.getEntries(),
                votes: Behaviour.getVotes()
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