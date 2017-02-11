/*global module:false*/
module.exports = function (grunt) {

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt);

    // rollup plugins
    var rollupPluginBabel = require('rollup-plugin-babel'),
        rollupPluginNodeResolve = require('rollup-plugin-node-resolve'),
        rollupPluginCommonjs = require('rollup-plugin-commonjs'),
        rollupPluginUglify = require('rollup-plugin-uglify');

    //Configuration
    grunt.initConfig({
        // Metadata.
        project: {
            pkg: grunt.file.readJSON('package.json'),
            banner: '/*! <%= project.pkg.title || project.pkg.name %> - v<%= project.pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= project.pkg.homepage ? "* " + project.pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= project.pkg.author.name %>;' +
            ' Licensed <%= project.pkg.license %> */\n'
        },

        clean: {
            'assets': [
                '<%= project.pkg.directories.public %>/assets',
                '<%= project.pkg.directories.public %>/**/*.html'
            ],
            'styles': '<%= project.pkg.directories.public %>/css',
            'scripts': '<%= project.pkg.directories.public %>/js'
        },

        eslint: {
            client: {
                files: {
                    src: [
                        '<%= project.pkg.directories.client %>/js/**.js'
                    ]
                }
            },
            server: {
                files: {
                    src: [
                        'Gruntfile.js',
                        '<%= project.pkg.directories.server %>/**.js'
                    ]
                }
            }
        },

        copy: {
            'assets': {
                files: [
                    {
                        cwd: '<%= project.pkg.directories.client %>',
                        expand: true,
                        src: [
                            'assets/**',
                            '**/*.html'
                        ],
                        dest: '<%= project.pkg.directories.public %>/'
                    }
                ]
            }
        },

        less: {
            options: {
                banner: '<%= project.banner %>',
                plugins: [
                    new (require('less-plugin-autoprefix'))({
                        browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1", "ie >= 10"]
                    }),
                    new (require('less-plugin-clean-css'))()
                ]
            },
            styles: {
                files: [
                    {
                        cwd: '<%= project.pkg.directories.client %>/less/',
                        expand: true,
                        src: [
                            '**/*.less',
                            '!_parts/**'
                        ],
                        dest: '<%= project.pkg.directories.public %>/css/',
                        ext: '.min.css'
                    }
                ]
            }
        },

        watch: {
            options: {
                'interrupt': true
            },
            "styles": {
                files: ['<%= project.pkg.directories.client %>/less/**/*.less'],
                tasks: [
                    'styles'
                ]
            },
            "assets": {
                files: [
                    '<%= project.pkg.directories.client %>/assets/**',
                    '<%= project.pkg.directories.client %>/**/*.html'
                ],
                tasks: [
                    'assets'
                ]
            },
            "scripts": {
                files: ['<%= project.pkg.directories.client %>/js/**/*.js'],
                tasks: [
                    'scripts'
                ]
            }
        },

        modernizr: {
            dist: {
                "dest": "<%= project.pkg.directories.public %>/js/libs/modernizr.js",
                "options": [
                    "setClasses",
                    "addTest",
                    "html5printshiv",
                    "testProp",
                    "fnBind"
                ],
                "uglify": false
            }
        },

        rollup: {
            options: {
                sourceMap: true,
                format: 'umd',
                plugins: function () {
                    return [
                        rollupPluginNodeResolve({
                            jsnext: true,
                            main: true,
                            browser: true
                        }),
                        rollupPluginCommonjs(),
                        rollupPluginBabel({
                            exclude: './node_modules/**'
                        }),
                        rollupPluginUglify()
                    ];
                }
            },
            dist: {
                options: {
                    moduleName: '<%= project.pkg.name %>'
                },
                files: [{
                    'dest': '<%= project.pkg.directories.public %>/js/main.js',
                    'src': '<%= project.pkg.directories.client %>/js/main.js' // Only one source file is permitted
                }]
            }
        }
    });

    grunt.registerTask("default", ['build']);

    grunt.registerTask("build", ['assets', 'styles', 'scripts']);
    grunt.registerTask("debug", ['build', 'watch']);

    grunt.registerTask('assets', ['clean:assets', 'copy:assets']);
    grunt.registerTask("styles", ['clean:styles', 'less:styles']);
    // TODO LN: optimize instead of copying scripts
    grunt.registerTask("scripts", ['clean:scripts', 'eslint:client', 'rollup', 'modernizr']);
};
