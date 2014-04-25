/* jshint node:true */
'use strict';

var request = require('request'),
    xml2js = require('xml2js');

var TEST = /(?:https?:\/\/|www\.|m\.|^)youtu(?:be\.com(?:\/embed)?\/watch\?(?:.*?&(?:amp;)?)?v=|\.be\/)([\w‌​\-]+)(?:&(?:amp;)?[\w\?=]*)?/;

var API = 'https://gdata.youtube.com/feeds/api/videos/';

var MIN_THUMB_HEIGHT = 240;

function parse(message) {
    var result = TEST.exec(message);

    if (result && result[1]) {
        return result[1];
    }

    return undefined;
}

function process(id, cb) {
    request(API + id, afterRequest(id, cb));
}

function afterRequest(id, cb) {
    return function (error, response, body) {
        if (!error && response.statusCode === 200) {

            xml2js.parseString(body, afterParse(id, cb));
        } else {
            cb(error);
        }
    };
}

function afterParse(id, cb) {
    return function (err, doc) {
        if (err) {
            cb(err);
            return;
        }

        doc = doc && doc['entry'];

        var media = doc['media:group'][0];

        var data = {
            id: id,
            title: doc.title[0]['_'],
            description: doc.content[0]['_'],
            uri: media && media['media:player'][0]['$']['url'],
            duration: media && media['yt:duration'][0]['$']['seconds'],
            thumb: media && media['media:thumbnail']
                .map(_filterThumbs)
                .filter(_cleanArray)[0]
        };

        // Convert from seconds to miliseconds
        data.duration = parseInt(data.duration, 10) * 1000;

        cb(undefined, data);
    };
}

function _filterThumbs(entry) {
    var data = entry['$'];

    if (data && parseInt(data.height, 10) > MIN_THUMB_HEIGHT) {
        return data.url;
    }
}

function _cleanArray(val) {
    return !!val;
}

module.exports = {
    parse: parse,
    process: process
};
