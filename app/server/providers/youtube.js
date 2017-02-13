const SETTINGS = require('../config');

const fetch = require('../utils/fetch');

const YOUTUBE_URL_REGEX = /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com(?:\/embed)?\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w?=]*)?/;
const ISO8601_DURATION_REGEX = /PT(\d+H)?(\d+M)?(\d+S)?/;

const API_BASE_URL = `https://www.googleapis.com/youtube/v3`;

const API_PART_API_KEY = `&key=${SETTINGS['youtube']['key']}`;

const API_URL_GET_DETAILS = id => API_BASE_URL + `/videos?id=${id}&part=snippet,contentDetails,status` + API_PART_API_KEY;
const API_URL_SEARCH = q => API_BASE_URL + `/search?q=${encodeURIComponent(q)}&regionCode=${SETTINGS['youtube']['region']}&safeSearch=moderate&type=video&videoDuration=short&videoEmbeddable=true&maxResults=10&part=snippet` + API_PART_API_KEY;

const NAME = "youtube";

function process(payload) {
    const videoID = getVideoID(payload.text);

    return fetchVideoDetails(videoID)
        .then(parseVideoDetails);
}

function random(payload) {
    return fetchRandomVideoDetails(payload.text)
        .then(entry => {
            return fetchVideoDetails(entry.id.videoId)
        })
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

    return doRequest(url);
}

function fetchRandomVideoDetails(query) {
    const url = API_URL_SEARCH(query);

    return doRequest(url);
}

function doRequest(url) {
    return fetch.json(url).then(data => {
        if (!data['pageInfo'] || data['pageInfo']['totalResults'] === 0) {
            throw new Error("NotFound");
        }

        return data['items'][getRandomInt(0, data['items'].length)];
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function parseVideoDetails(data) {
    return {
        id: data.id,
        provider: NAME,
        url: `https://youtu.be/${data.id}`,
        isLive: data.snippet.liveBroadcastContent !== "none",
        isEmbeddable: !(data['status'] && data['status']['embeddable'] === false),
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
    NAME: NAME,
    PATTERN: YOUTUBE_URL_REGEX,
    process: process,
    random: random
};