
var TEST = /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com(?:\/embed)?\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/;

function process(payload) {
    const videoID = getVideoID(payload.text);

    console.info(`User ${payload.user_id} added video with ID: ${videoID}`);

    return `Adding video with ID: ${videoID}`;
}

function canProcess(text) {
    return getVideoID(text) !== undefined;
}

function getVideoID(text) {
    const result = TEST.exec(text);

    if (result && result[1]) {
        return result[1];
    }

    return undefined;
}

module.exports = {
    canProcess: canProcess,
    process: process
};