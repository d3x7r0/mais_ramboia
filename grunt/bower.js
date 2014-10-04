module.exports = function (grunt, options) {
    "use strict";

    return {
        'config': {
            rjsConfig: '<%= pkg.directories.client %>/js/config.js',
            options: {
                exclude: [ 'modernizr', 'pure', 'fontawesome', 'requirejs' ],
                baseUrl: '<%= pkg.directories.client %>/js'
            }
        }
    };
};