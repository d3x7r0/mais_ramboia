require.config({
    baseUrl: 'js',
    shim: {
        'socket.io': {
            exports: 'io'
        },
        zepto: {
            exports: '$'
        }
    },
    map: {
        '*': {
            promises: 'bluebird'
        }
    },
    paths: {
        'socket.io': '/rt/socket.io',
        moment: '../bower_components/moment/moment',
        zepto: '../bower_components/zepto/zepto',
        bluebird: '../bower_components/bluebird/js/browser/bluebird',
        lodash: '../bower_components/lodash/lodash'
    },
    packages: [

    ]
});