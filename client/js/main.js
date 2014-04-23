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

    var TEMPLATES = {
        CHAT: '<p><span class="username"><%- it.usr.name %></span>: <%- it.msg %></p>',
        SYSTEM: '<p class="system"><em><span class="username"><%- it.usr.name %></span> <%- it.msg %></em></p>',
        ENTRY: '<li title="<%- it.title %> (Requested by <%- it.user %>)">' +
            '<span style="background-image: url(<%- it.thumb %>)"></span>' +
            '<header>' +
            '<p><%- it.title %></p>' +
            '</header>' +
            '</li>'
    };

    // variables
    var _loaded = when.defer();

    var _currentUsername = 'Nameless User';

    // DOM elements
    var _$form,
        _$user,
        _$input;

    var _$messages,
        _$playlist;

    var _$mute,
        _$skip;

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
                init: _onInit,
                chat: _onChat,
                name: _onNameChange,
                playlist: _onPlaylistChange,
                video: _onVideoChange,
                skip: _onSkipResponse
            }
        });

        cloak.run('//' + window.location.hostname + ':' + SETTINGS.PORT);
    }

    function _onBegin() {
        cloak.message('init');
        _initTemplates();
    }

    function _onInit(data) {
        data = data || {};

        _onChat(data.chat);
        _onNameChange(data.name);

        if (data.playlist) {
            _onPlaylistChange(data.playlist);
            _onVideoChange(data.video);
        }

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
            _.forEach($('input, button'), function (el) {
                $(el).removeAttr('disabled');
            });
        });
    }

    function _disableForm() {
        _loaded.promise.then(function () {
            _.forEach($('input, button'), function (el) {
                $(el).attr('disabled', 'disabled');
            });
        });
    }

    var _initTemplates = function () {
        for (var k in TEMPLATES) {
            if (!TEMPLATES.hasOwnProperty(k)) {
                continue;
            }

            TEMPLATES[k] = _.template(TEMPLATES[k]);
        }
    };

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
        entry = entry || {};

        var tmpl = entry.system ? TEMPLATES.SYSTEM : TEMPLATES.CHAT;

        return $.create(tmpl({
            it: entry
        }));
    }

    function _onDomLoaded() {
        _$form = $('#chat-form');
        _$input = $('input', '#chat-form');
        _$user = $('#chat-name');

        _$messages = $('.entries .inner', '#chat-container');
        _$playlist = $('.playlist ul', '#video-container');

        _$mute = $('#mute');
        _$skip = $('#skip');

        _initListeners();

        _loaded.resolve();
    }

    function _initListeners() {
        _$form.on('submit', _onSubmit);
        _$user.on('click', _onUserClick);

        _$mute.on('click', _onMuteToggle);
        _$skip.on('click', _onSkipClick);
    }

    function _onSubmit(e) {
        e.preventDefault();

        var msg = _$input.val();

        if (msg.length > 0) {
            cloak.message('chat', msg);
            _$input.val('');
        }
    }

    function _onUserClick() {
        var newUsername = prompt("Username", _currentUsername);

        if (newUsername && newUsername.length > 1) {
            cloak.message('name', newUsername);
        }
    }

    function _onMuteToggle() {
        player.toggleMute().then(function (muted) {
            var _$icon = $(_$mute.find('i')),
                _$label = $(_$mute.find('span'));

            if (muted) {
                _$label.text('Unmute');

                _$icon.removeClass('fa-volume-up');
                _$icon.addClass('fa-volume-off');

                _$mute.addClass('pure-button-active');
            } else {
                _$label.text('Mute');

                _$icon.addClass('fa-volume-up');
                _$icon.removeClass('fa-volume-off');

                _$mute.removeClass('pure-button-active');
            }
        });
    }

    function _onSkipClick() {
        _$skip.attr('disabled', true);

        cloak.message('skip');
    }

    function _onSkipResponse(error) {
        if (error && error != 'DUPLICATE_VOTE') {
            _$skip.attr('disabled', false);
        }
    }

    function _onNameChange(name) {
        _currentUsername = name;
    }

    function _onVideoChange(video) {
        video = video || {};

        if (!video.id) {
            player.stop();
        } else {
            player.play(video.id, video.timestamp);
            _$skip.attr('disabled', false);
        }
    }

    function _onPlaylistChange(playlist) {
        _loaded.promise.then(function () {
            var $elements = _.chain(playlist)
                .map(_renderPlaylistEntry)
                .flatten()
                .compact()
                .value();

            _$playlist.html($elements);
        });
    }

    function _renderPlaylistEntry(entry) {
        return $.create(
            TEMPLATES.ENTRY({
                it: entry
            })
        );
    }

    // Init
    function init() {
        _loadSettings().then(_setup);
        $.ready(_onDomLoaded);
    }

    init();

    return {};
});
