var assert = require('assert'),
    vows = require('vows');

var youtube = require('../../src/providers/youtube');

var URLS = [
    {
        url: "https://youtu.be/yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "https://www.youtube.com/embed/yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "youtu.be/yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "youtube.com/watch?v=yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://youtu.be/yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/embed/yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/watch?v=yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/watch?v=yVpbFMhOAwE&feature=g-vrec", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/watch?v=yVpbFMhOAwE&feature=player_embedded", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/v/yVpbFMhOAwE?fs=1&hl=en_US", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/ytscreeningroom?v=yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/watch?NR=1&feature=endscreen&v=yVpbFMhOAwE", id: "yVpbFMhOAwE"},
    {
        url: "http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo", id: "1p3vcRhsYGo"},
    {
        url: "http://www.youtube.com/watch?v=6zUVS4kJtrA&feature=c4-overview-vl&list=PLbzoR-pLrL6qucl8-lOnzvhFc2UM1tcZA", id: "6zUVS4kJtrA"},
    {
        url: "https://www.youtube.com/watch?v=FZu097wb8wU&list=RDFZu097wb8wU", id: "FZu097wb8wU"
    }
];

vows.describe('YouTube').addBatch({
    "When given the URL": _buildUrlTests(URLS)
}).export(module);

function _buildUrlTests(data) {
    var output = {};

    data.forEach(function (entry) {
        output[entry.url] = _buildUrlTest(entry);
    });

    return output;
}

function _buildUrlTest(data) {
    var entry = {
        topic: data.url
    };

    entry['parses it as ' + data.id] = function (result) {
        assert.equal(result, data.url);
    };

    return entry;
}
