// RequireJS configs
require.config({
    paths: {
        // Utils
        'console': 'utils/console',
        'dom': 'utils/dom',
        // Socket.IO
        'socket.io': '/socket.io/socket.io',
        // Libs
        'cloak': 'libs/cloak-client',
        // Bower
        'promises': '../vendor/q/q',
        'underscore': '../vendor/underscore/underscore',
        'domready': '../vendor/domready/ready',
        'reqwest': '../vendor/reqwest/reqwest',
        'bonzo': '../vendor/bonzo/bonzo',
        'qwery': '../vendor/qwery/qwery',
        'bean': '../vendor/bean/bean'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'cloak': {
            deps: [ 'socket.io' ],
            exports: 'cloak'
        }
    }
});

define(function (require) {
    'use strict';

    // Requires
    var console = require('console'),
        when = require('promises');

    var reqwest = require('reqwest'),
        _ = require('underscore'),
        $ = require('dom');

    var cloak = require('cloak');

    var player = require('parts/player');

    // constants
    var SETTINGS = {
        API: {
            SETTINGS: '/api/settings'
        }
    };

    // variables
    var _loaded = when.defer();

    var _currentUsername = 'Nameless User';

    // DOM elements
    var _$form,
        _$user,
        _$input,
        _$messages;

    function _loadSettings() {
        var deferred = when.defer();

        reqwest(SETTINGS.API.SETTINGS)
            .then(function onSuccess(settings) {
                SETTINGS = _.defaults(settings, SETTINGS);

                deferred.resolve(SETTINGS);
            },
            function onError(err) {
                console.debug(err);
                alert('There was an error loading the settings from the server');

                deferred.reject();
            }
        );

        return deferred.promise;
    }

    function _setup() {
        cloak.configure({
            serverEvents: {
                begin: _onBegin,
                resume: _onResume,
                disconnect: _onDisconnect
            },
            messages: {
                chat: _onChat,
                name: _onNameChange,
                playlist: _onPlaylistChange,
                video: _onVideoChange
            }
        });

        cloak.run('//' + window.location.hostname + ':' + SETTINGS.PORT);
    }

    function _onBegin() {
        cloak.message('init');
        _enableForm();
    }

    function _onResume() {
        _enableForm();
    }

    function _onDisconnect() {
        _disableForm();
    }

    function _enableForm() {
        _loaded.promise.then(function () {
            _.forEach(_$form.find('[disabled]'), function ($el) {
                $el.disabled = false;
            })
        });
    }

    function _disableForm() {
        _loaded.promise.then(function () {
            _$input.disabled = true;

            _.forEach(_$form.find('button'), function ($el) {
                $el.disabled = true;
            })
        });
    }

    function _onChat(entries) {
        _loaded.promise.then(function () {
            var $elements = _.chain(entries)
                .map(_printMessage)
                .flatten()
                .compact()
                .value();

            _$messages.prepend($elements);
        });
    }

    function _printMessage(entry) {
        return $.create('<p>' + entry.usr.name + ': ' + entry.msg + '</p>');
    }

    function _onDomLoaded() {
        _$form = $('#chat-form');
        _$input = $('input', '#chat-form');
        _$user = $('#chat-name');

        _$messages = $('.entries .inner', '#chat-container');

        _initListeners();

        _loaded.resolve();
    }

    function _initListeners() {
        _$form.on('submit', _onSubmit);
        _$user.on('click', _onUserClick)
    }

    function _onSubmit(e) {
        e.preventDefault();

        var msg = _$input.val();

        if (msg.length > 0) {
            cloak.message('chat', msg);
            _$input.val('');
        }
    }

    function _onUserClick(e) {
        var newUsername = prompt("Username", _currentUsername);

        if (newUsername && newUsername.length > 1) {
            cloak.message('name', newUsername);
        }
    }

    function _onNameChange(name) {
        _currentUsername = name;
    }

    function _onPlaylistChange(playlist) {
        console.log(playlist);
    }

    function _onVideoChange(video) {
        player.play(video.id, video.timestamp);
    }

    // Init
    function init() {
        _loadSettings().then(_setup);
        $.ready(_onDomLoaded);
    }

    init();

    return {};
});