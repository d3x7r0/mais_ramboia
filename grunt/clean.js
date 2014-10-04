module.exports = function(grunt, options) {
    "use strict";

    return {
        'assets': [
            '<%= pkg.directories.public %>/bower_components',
            '<%= pkg.directories.public %>/assets',
            '<%= pkg.directories.public %>/**/*.html'
        ],
        'styles': '<%= pkg.directories.public %>/css',
        'scripts': '<%= pkg.directories.public %>/js'
    };
};