/* jshint node:true */
'use strict';

var rc = require('rc');

var DEFAULTS = {
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    dir: {
        client: __dirname + '/../../_public'
    },
    auth: {
        session: {
            secret: 'session secret here'
        },
        google: {
            'clientId': 'your-secret-clientID-here',
            'clientSecret': 'your-client-secret-here',
            // TODO LN: generate at runtime
            'callbackUrl': 'http://127.0.0.1:8080/login/google'
        }
    },
    db: {
        // Reference: https://github.com/brianc/node-postgres/wiki/pg
        database: 'mais_ramboia',
        host: 'localhost'
    }
};

module.exports = rc('maisramboia', DEFAULTS);
