module.exports = function (grunt, options) {
    "use strict";

    return {
        options: {
            'interrupt': true
        },
        "styles": {
            files: [ '<%= pkg.directories.client %>/less/**/*.less' ],
            tasks: [
                'styles'
            ]
        },
        "assets": {
            files: [
                '<%= pkg.directories.client %>/bower_components/**',
                '<%= pkg.directories.client %>/assets/**',
                '<%= pkg.directories.client %>/**/*.html'
            ],
            tasks: [
                'assets'
            ]
        },
        "scripts": {
            files: [ '<%= pkg.directories.client %>/js/**/*.js' ],
            tasks: [
                'scripts'
            ]
        }
    };
};