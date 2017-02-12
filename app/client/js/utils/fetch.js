/* global fetch:false */
// FIXME: this file is duplicated here from the server due to imports only
import "whatwg-fetch";

export default function _fetch(url, opts) {
    return fetch(url, opts).then(checkStatus);
}

export function fetchJSON(url, opts) {
    return _fetch(url, opts).then(res => res.json());
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        let error = new Error(response.statusText || response.status);
        error.response = response;
        throw error;
    }
}