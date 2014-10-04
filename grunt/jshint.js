module.exports = function (grunt, options) {
    "use strict";

    var pkg = options.pkg;

    return {
        client: {
            options: grunt.file.readJSON(pkg.directories.client + '/.jshintrc'),
            files: {
                src: [
                    '<%= pkg.directories.client %>/js/**.js'
                ]
            }
        },
        server: {
            options: grunt.file.readJSON('.jshintrc'),
            files: {
                src: [
                    'Gruntfile.js',
                    'grunt/**.js',
                    '<%= pkg.directories.server %>/**.js'
                ]
            }
        }
    };
};