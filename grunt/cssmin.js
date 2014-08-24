module.exports = function(grunt, options) {
    "use strict";

    return {
        "styles": {
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
    }
};