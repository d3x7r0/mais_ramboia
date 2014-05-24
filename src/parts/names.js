/* jshint node:true */
'use strict';

var fs = require('fs');

var NAMES_FILE = __dirname + '/../../resources/names.txt';

var NAMES = [];

function init() {
    fs.readFile(NAMES_FILE, { encoding: 'utf-8' }, function (err, data) {
        "use strict";
        if (err) {
            console.warn("Error loading list of random names", err);
        } else {
            NAMES = data && String(data).split('\n') || [];
        }
    });
}

function getRandomName() {
    return NAMES[Math.random() * (NAMES.length - 1) | 0] || 'Nameless User';
}

init();

module.exports = {
    getRandomName: getRandomName
};
