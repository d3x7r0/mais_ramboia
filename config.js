/* jshint node:true */

var rc = require('rc');

var DEFAULTS = {
    PORT: 8080,
    DIR: {
        STATIC: __dirname + '/client',
        BOWER: __dirname + '/bower_components',
        LESS: __dirname + '/less'
    },
    MAX_ENTRIES: 100
};

module.exports = rc('mais_ramboia', DEFAULTS);