/* jshint node:true */
'use strict';

var rc = require('rc');

var DEFAULTS = {
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    dir: {
        client: __dirname + '/../../_public'
    },
    slack: {
        token: undefined,
        channel_id: undefined,
        channel_name: undefined
    }
};

module.exports = rc('maisramboia', DEFAULTS);
