/* globals YT:false */
define(function (require) {
    'use strict';

    // Requires
    var when = require('promises');

    var bean = require('bean');

    // Constants
    var PLAYER_ID = 'player',
        WIDTH = '640',
        HEIGHT = '390';

    var PLAYER_SETTINGS = {
        controls: 0,
        disablekb: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
    };

    // Variables
    var _loaded = when.defer();

    var _player;

    (function init() {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    })();

    window.onYouTubeIframeAPIReady = function () {
        _loaded.resolve();
    };

    function play(videoId, startTime) {
        var deferred = when.defer();

        var listener;

        function start() {
            _player.playVideo();

            listener = bean.on(_player, 'statechanged', correct);
        }

        function correct(e) {
            if (e.data === YT.PlayerState.PLAYING) {
                bean.off(_player, 'statechanged', correct);

                if (startTime) {
                    var delta = Math.round((+(new Date()) - startTime) / 1000);

                    _player.seekTo(delta, true);
                }

                deferred.resolve();
            }
        }

        _loaded.promise.then(function () {
            if (!_player) {
                _initPlayer(videoId).then(start, deferred.reject);
            } else {
                _setVideo(videoId).then(start, deferred.reject);
            }
        }, deferred.reject);

        return deferred.promise;
    }

    function _setVideo(videoId) {
        _player.loadVideoById(videoId);

        return when.resolve();
    }

    function _initPlayer(videoId) {
        var deferred = when.defer();

        _player = new YT.Player(PLAYER_ID, {
            height: HEIGHT,
            width: WIDTH,
            videoId: videoId,
            playerVars: PLAYER_SETTINGS,
            events: {
                'onReady': function onPlayerReady() {
                    deferred.resolve(_player);
                },
                'onStateChange': _onPlayerStateChange
            }
        });

        return deferred.promise;
    }

    function _onPlayerStateChange(event) {
        bean.fire(_player, 'statechanged', event);
    }

    function on() {
        _loaded.promise.then(function () {
            var args = Array.prototype.slice.call(arguments, 0);

            args.unshift(_player);

            return bean.on.apply(null, args);
        });
    }

    function off() {
        _loaded.promise.then(function () {
            var args = Array.prototype.slice.call(arguments, 0);

            args.unshift(_player);

            return bean.off.apply(null, args);
        });
    }

    return {
        play: play,
        on: on,
        off: off
    };
});