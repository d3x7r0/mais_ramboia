/* global YT: false */
define(function (require) {
    'use strict';

    // Dependencies
    var when = require('promises'),
        _ = require('underscore');

    // Constants
    var WIDTH = '640',
        HEIGHT = '390';

    var PLAYER_SETTINGS = {
        controls: 0,
        disablekb: 1,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        origin: window.location.hostname,
        playsinline: 1
    };

    // Variables
    var _loaded = when.defer();

    // Load youtube player library
    (function init() {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    })();

    window.onYouTubeIframeAPIReady = function () {
        _loaded.resolve();
    };

    // Player
    function Player($el) {
        var self = this;

        this._$el = $($el);

        var id = this._$el.attr('id') || _generateId();
        this._$el.attr('id', id);

        this._load = _.bind(this._load, this);

        var _deferred = when.defer();
        this._ready = _deferred.promise;

        _loaded.promise.then(function () {
            self._player = new YT.Player(id, {
                height: HEIGHT,
                width: WIDTH,
                videoId: '',
                playerVars: PLAYER_SETTINGS,
                events: {
                    'onReady': function onPlayerReady() {
                        _deferred.resolve(self._player);
                        self._$el.trigger('player:ready');
                    },
                    'onStateChange': function (e) {
                        var isProtected = _protectPlayer.call(self, e.data);

                        if (!isProtected) {
                            _triggerEvents.call(self, e.data);
                        }
                    }
                }
            });
        });
    }

    Player.prototype.on = function () {
        this._$el.on.apply(this, arguments);

        return this;
    };

    Player.prototype.off = function () {
        this._$el.off.apply(this, arguments);

        return this;
    };

    Player.prototype.toggleMute = function () {
        return this._ready.then(function (_player) {
            var muted = _player.isMuted();

            if (muted) {
                _player.unMute();
            } else {
                _player.mute();
            }

            return {
                muted: !muted
            };
        });
    };

    Player.prototype.mute = function () {
        return this._ready.then(function (_player) {
            _player.mute();

            return {
                muted: true
            };
        });
    };

    Player.prototype.unMute = function () {
        return this._ready.then(function (_player) {
            _player.unMute();

            return {
                muted: false
            };
        });
    };

    Player.prototype.isMuted = function () {
        return this._ready.then(function (_player) {
            return {
                muted: _player.isMuted()
            };
        });
    };

    Player.prototype.getTime = function () {
        return this._ready.then(function (_player) {
            return {
                total: _player.getDuration(),
                elapsed: _player.getCurrentTime()
            };
        });
    };

    Player.prototype.stop = function () {
        return this._ready.then(function (_player) {
            self._locked = true;

            _player.stopVideo();

            return true;
        });
    };

    Player.prototype.play = function (id, offset) {
        var self = this;

        var _load = this._load;

        return this._ready.then(function (_player) {
            self._locked = false;

            return _load(_player, id, offset);
        });
    };

    Player.prototype._load = function (_player, id, offset) {
        var deferred = when.defer();

        this._$el.one('player:playing', function () {
            deferred.resolve(_player);
        });

        _player.loadVideoById(id, offset);

        return deferred.promise;
    };

    // Private functions
    var COUNTER = 0;

    function _generateId() {
        return '#player_' + (COUNTER++);
    }

    var _protectPlayer = function _protectPlayer(state) {
        var isProtected = false;

        if (state === YT.PlayerState.PAUSED) {
            var isFinished = this._player.getCurrentTime() === this._player.getDuration();

            if (this._locked) {
                this._player.stopVideo();
                isProtected = true;
            } else if (isFinished) {
                this._locked = true;
            } else {
                // Computer says NO! (prevent users from pausing the video)
                this._player.playVideo();
                isProtected = true;
            }
        }

        if (state === YT.PlayerState.PLAYING && this._locked) {
            this._player.stopVideo();
            isProtected = true;
        }

        return isProtected;
    };

    var _triggerEvents = function _triggerEvents(state) {
        switch (state) {
            case YT.PlayerState.ENDED:
            case YT.PlayerState.PAUSED:
                this._$el.trigger('player:stopped', [ state ]);
                break;
            case YT.PlayerState.PLAYING:
                this._$el.trigger('player:playing', [ state ]);
                break;
        }

        this._$el.trigger('player:statechange', [ state ]);
    };

    return Player;
});