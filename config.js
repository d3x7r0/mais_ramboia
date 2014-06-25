/* jshint node:true */

var rc = require('rc');

var DEFAULTS = {
    PORT: Number(process.env.OPENSHIFT_NODEJS_PORT),
    IP: process.env.OPENSHIFT_NODEJS_IP,
    DIR: {
        STATIC: __dirname + '/client',
        BOWER: __dirname + '/bower_components',
        LESS: __dirname + '/less'
    },
    MAX_ENTRIES: 100,
    REVERSE_PROXY_MODE: false
};

module.exports = rc('maisramboia', DEFAULTS);
