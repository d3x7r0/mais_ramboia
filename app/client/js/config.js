require.config({
    baseUrl: 'js',
    shim: {
        'socket.io': {
            exports: 'io'
        },
        underscore: {
            exports: '_'
        },
        zepto: {
            exports: '$'
        }
    },
    map: {
        '*': {
            promises: 'q'
        }
    },
    paths: {
        'socket.io': '/socket.io/socket.io',
        underscore: '../bower_components/underscore/underscore',
        moment: '../bower_components/moment/moment',
        q: '../bower_components/q/q',
        zepto: '../bower_components/zepto/zepto'
    },
    packages: [

    ]
});