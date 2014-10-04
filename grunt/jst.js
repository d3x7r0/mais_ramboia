module.exports = function(grunt, options) {
    'use strict';

    var pkg = options.pkg;

    return {
        compile: {
            src: '<%= pkg.directories.client %>/templates/**/*.tpl',
            dest: '<%= pkg.directories.public %>/js/templates.js',
            options: {
                amd: true,
                prettify: true,
                processName: function (filename) {
                    var path = pkg.directories.client + '/templates/';

                    var fn = filename.substring(path.length);
                    fn = fn.substring(0, fn.length - 4);
                    fn = fn.replace(/\//g, '.');

                    return fn;
                }
            }
        }
    };
};