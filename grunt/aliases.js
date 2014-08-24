module.exports = function(grunt, options) {
    "use strict";

    return {
        "default": [ 'assets', 'styles' ],
        "debug": [ 'default', 'watch' ],
        'assets': [ 'clean:assets', 'copy:assets' ],
        "styles": [ 'clean:styles', 'less:styles', 'autoprefixer:styles', 'cssmin:styles' ]
    }
};