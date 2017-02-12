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
            playlist: {
                current: pl.getCurrent(),
                entries: pl.getEntries()
            }
        }
    }
}

function setHealthy(status) {
    HEALTHY = !!status;
}

module.exports = {
    getStatus: getStatus,
    setHealthy: setHealthy
};