const rawfetch = require('node-fetch'),
    Bluebird = require('bluebird');

rawfetch.Promise = Bluebird;

function fetch(url, opts) {
    return rawfetch(url, opts).then(checkStatus);
}

function fetchJSON(url, opts) {
    return fetch(url, opts).then(res => res.json());
}

module.exports = fetch;
module.exports.json = fetchJSON;

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        let error = new Error(response.statusText || response.status);
        error.response = response;
        throw error;
    }
}