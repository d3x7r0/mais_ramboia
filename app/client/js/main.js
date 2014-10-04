define(function (require) {
    'use strict';

    // Dependencies
    var console = require('utils/console'),
        when = require('promises');

    var _ = require('underscore'),
        $ = require('zepto');

    // Widgets
    var Tab = require('widgets/tabs'),
        Player = require('widgets/player');

    // Public methods
    function start() {
        $(_init);
    }

    var _player;

    // Private methods
    function _init() {
        $('.js-tab-container').forEach(function (entry) {
            new Tab(entry);
        });

        _player = new Player('#player');

        _player.play('dQw4w9WgXcQ', 180).then(function() {
            console.log("Playing");
        });
        _player.mute();
    }

    function _delta(startTime) {
        return Math.round((startTime - _now()) / 1000);
    }

    function _now() {
        return window.performance.timing.navigationStart + window.performance.now();
    }

    return {
        start: start,
        _getPlayer: function () {
            return _player;
        }
    };
});