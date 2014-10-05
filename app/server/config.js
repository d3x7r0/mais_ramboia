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
        },
        GOOGLE: {
            'CLIENT_ID': 'your-secret-clientID-here',
            'CLIENT_SECRET': 'your-client-secret-here',
            'CALLBACK_URL': 'http://127.0.0.1:8080/user/login/google'
        }
    }
};

module.exports = rc('maisramboia', DEFAULTS);
