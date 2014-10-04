module.exports = function(grunt, options) {
    "use strict";

    return {
        "default": [ 'assets', 'styles', 'scripts' ],
        "debug": [ 'default', 'watch' ],
        'assets': [ 'clean:assets', 'copy:assets' ],
        "styles": [ 'clean:styles', 'less:styles', 'autoprefixer:styles', 'cssmin:styles' ],
        // TODO LN: optimize instead of copying scripts
        "scripts": [ 'clean:scripts', 'copy:scripts', 'jst:compile' ]
    }
};