/* jshint node:true */
'use strict';

const rc = require('rc');

const DEFAULTS = {
    hostname: "0.0.0.0",
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    dir: {
        client: __dirname + '/../../_public'
    },
    slack: {
        token: undefined,
        channel_id: undefined,
        channel_name: undefined
    },
    youtube: {
        key: undefined
    },
    playlist: {
        minDuration: 0
    }
};

module.exports = rc('maisramboia', DEFAULTS);
