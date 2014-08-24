module.exports = function(grunt, options) {
    "use strict";

    return {
        'assets': {
            files: [
                {
                    cwd: '<%= pkg.directories.client %>',
                    expand: true,
                    src: [
                        'bower_components/**',
                        'assets/**',
                        '**/*.html'
                    ],
                    dest: '<%= pkg.directories.public %>/'
                }
            ]
        }
    };
};