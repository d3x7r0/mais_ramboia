/* jshint node:true */
'use strict';

const rc = require('rc');
const path = require('path');

const DEFAULTS = {
    hostname: "0.0.0.0",
    port: Number(process.env.PORT || 8080),
    reverseProxyMode: false,
    url: undefined,
    dir: {
        client: path.resolve(__dirname, '../../_public')
    },
    slack: {
        token: undefined
    },
    youtube: {
        /**
         * this is an ISO 3166-1 alpha-2 country code
         * <http://www.iso.org/iso/country_codes/iso_3166_code_lists/country_names_and_code_elements.htm>
         */
        region: 'PT',
        key: undefined
    },
    playlist: {
        maxRelated: 10,
        minDuration: 0,
        votes: 5
    }
};

module.exports = rc('maisramboia', DEFAULTS);
