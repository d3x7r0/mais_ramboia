module.exports = function(grunt, options) {
    "use strict";

    return {
        "styles": {
            options: {
                // A bug with clean-css < 2.4 strips -webkit-flexbox
                noAdvanced: true
            },
            files: [
                {
                    cwd: '<%= pkg.directories.public %>/css/',
                    expand: true,
                    src: [
                        '**/*.css'
                    ],
                    dest: '<%= pkg.directories.public %>/css/',
                    ext: '.min.css'
                }
            ]
        }
    };
};