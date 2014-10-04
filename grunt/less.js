module.exports = function(grunt, options) {
    "use strict";

    return {
        options: {
            sourceMap: true,
            banner: '<%= project.banner %>'
        },
        'styles': {
            files: [
                {
                    cwd: '<%= pkg.directories.client %>/less/',
                    expand: true,
                    src: [
                        '**/*.less',
                        '!_parts/**'
                    ],
                    dest: '<%= pkg.directories.public %>/css/',
                    ext: '.css'
                }
            ]
        }
    };
};