/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    var CONFIG = {
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        project: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= pkg.license %> */\n'
        }
    };

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt);

    //Configuration
    require('load-grunt-config')(grunt, { data: CONFIG });

};
