const SETTINGS = require('../config');

const fetch = require('../utils/fetch');

const YOUTUBE_URL_REGEX = /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com(?:\/embed)?\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/;
const ISO8601_DURATION_REGEX = /PT(\d+H)?(\d+M)?(\d+S)?/;

const API_URL_GET_DETAILS = (id) => `https://www.googleapis.com/youtube/v3/videos?key=${SETTINGS['youtube']['key']}&id=${id}&part=snippet,contentDetails`;


function canProcess(text) {
    return getVideoID(text) !== undefined;
}

function process(payload) {
    const videoID = getVideoID(payload.text);

    console.info(`User ${payload.user_id} added video with ID: ${videoID}`);

    return fetchVideoDetails(videoID)
        .then(parseVideoDetails);
}

function getVideoID(text) {
    const result = YOUTUBE_URL_REGEX.exec(text);

    if (result && result[1]) {
        return result[1];
    }

    return undefined;
}

function fetchVideoDetails(id) {
    const url = API_URL_GET_DETAILS(id);

    return fetch.json(url).then(function (data) {
        if (!data['pageInfo'] || data['pageInfo']['totalResults'] !== 1) {
            throw new Error("Not Found");
        }

        return data['items'][0];
    });
}

function parseVideoDetails(data) {
    return {
        id: data.id,
        isLive: data.snippet.liveBroadcastContent !== "none",
        title: data.snippet.title || "",
        description: data.snippet.description || "",
        thumbnail: parseVideoThumbnail(data.snippet.thumbnails || {}),
        duration: parseVideoDuration(data.contentDetails.duration || "")
    };
}

function parseVideoThumbnail(list) {
    const thumb = pickVideoThumbnail(list);

    return thumb && thumb['url'];
}

function pickVideoThumbnail(list) {
    if (list['standard']) {
        return list['standard'];
    }

    // If the standard thumb isn't available use the largest that isn't maxres
    return Object.keys(list)
        .filter(size => size !== "maxres")
        .map(size => list[size])
        .sort((a, b) => b.height - a.height)
        .pop();
}

function parseVideoDuration(duration) {
    const match = duration.match(ISO8601_DURATION_REGEX);

    let hours = (parseInt(match[1]) || 0);
    let minutes = (parseInt(match[2]) || 0);
    let seconds = (parseInt(match[3]) || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

module.exports = {
    canProcess: canProcess,
    process: process
};