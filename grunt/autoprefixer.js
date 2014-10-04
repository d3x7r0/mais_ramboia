module.exports = function (grunt, options) {
    "use strict";

    return {
        options: {
            map: true
        },
        "styles": {
            files: [
                {
                    cwd: '<%= pkg.directories.public %>/css/',
                    expand: true,
                    src: [
                        '**/*.css'
                    ],
                    dest: '<%= pkg.directories.public %>/css/'
                }
            ]
        }
    };
};