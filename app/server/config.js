/* jshint node:true */
'use strict';

var rc = require('rc');

var DEFAULTS = {
    PORT: Number(process.env.PORT || 8080),
    REVERSE_PROXY_MODE: false,
    DIR: {
        CLIENT: __dirname + '/../../_public'
    },
    AUTH: {
        SESSION: {
            SECRET: 'session secret here'
        }
    }
};

module.exports = rc('maisramboia', DEFAULTS);
