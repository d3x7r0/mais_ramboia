/* jshint node:true */
'use strict';

var rc = require('rc');

var DEFAULTS = {
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    dir: {
        client: __dirname + '/../../_public'
    }
};

module.exports = rc('maisramboia', DEFAULTS);
