/* global YT: false */
'use strict';
// Dependencies
import Promise from "bluebird";
import DOM from "../utils/dom";

// Constants
const WIDTH = '640',
    HEIGHT = '390';

const PLAYER_SETTINGS = {
    controls: 0,
    disablekb: 1,
    iv_load_policy: 3,
    modestbranding: 1,
    rel: 0,
    showinfo: 0,
    origin: window.location.hostname,
    playsinline: 1
};

// Globals
const _loaded = new Promise(resolve => {
    window.onYouTubeIframeAPIReady = () => {
        resolve();
    };

    DOM.loadScript("https://www.youtube.com/iframe_api").then(
        () => console.debug("Youtube script loaded"),
        err => {
            throw err;
        }
    );
});

let COUNTER = 0;

// Player
export default class Player {
    constructor(selector) {
        this._$el = DOM.find(selector).pop();

        const id = this._$el.getAttribute('id') || Player._generateID();
        this._$el.setAttribute('id', id);

        this._load = this._load.bind(this);

        const options = {
            height: HEIGHT,
            width: WIDTH,
            videoId: '',
            playerVars: PLAYER_SETTINGS,
            events: {
                'onStateChange': e => {
                    let isProtected = this._protectPlayer(e.data);

                    if (!isProtected) {
                        this._triggerEvents(e.data);
                    }
                }
            }
        };

        this._ready = _loaded
            .then(() => Player._build(id, options))
            .then(player => {
                this._player = player;

                DOM.trigger(this._$el, 'player:ready');

                return player;
            });
    }

    on(eventName, eventHandler) {
        this._$el.addEventListener(eventName, eventHandler);

        return this;
    }

    off(eventName, eventHandler) {
        this._$el.removeEventListener(eventName, eventHandler);

        return this;
    }

    toggleMute() {
        return this._ready.then(player => {
            let muted = player.isMuted();

            if (muted) {
                player.unMute();
            } else {
                player.mute();
            }

            return {
                muted: !muted
            };
        });
    }

    mute() {
        return this._ready.then(player => {
            player.mute();

            return {
                muted: true
            };
        });
    }

    unMute() {
        return this._ready.then(player => {
            player.unMute();

            return {
                muted: false
            };
        });
    }

    isMuted() {
        return this._ready.then(player => ({
            muted: player.isMuted()
        }));
    }

    getTime() {
        return this._ready.then(player => ({
            total: player.getDuration(),
            elapsed: player.getCurrentTime()
        }));
    }

    stop() {
        return this._ready.then(player => {
            self._locked = true;

            player.stopVideo();

            return true;
        });
    }

    play(id, offset) {
        return this._ready.then(player => {
            this._locked = false;

            return this._load(player, id, offset);
        });
    }

    _load(_player, id, offset) {
        return new Promise(resolve => {
            const fn = () => {
                this.off('player:playing', fn);
                resolve(_player);
            };

            this.on('player:playing', fn);

            _player.loadVideoById(id, offset);
        });
    }


    _protectPlayer(state) {
        let isProtected = false;

        if (state === YT.PlayerState.PAUSED) {
            let isFinished = this._player.getCurrentTime() === this._player.getDuration();

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
    }

    _triggerEvents(state) {
        switch (state) {
            case YT.PlayerState.ENDED:
            case YT.PlayerState.PAUSED:
                DOM.trigger(this._$el, 'player:stopped', {state: state});
                break;
            case YT.PlayerState.PLAYING:
                DOM.trigger(this._$el, 'player:playing', {state: state});
                break;
        }

        DOM.trigger(this._$el, 'player:statechange', {state: state});
    }

    static _generateID() {
        return '#player_' + (COUNTER++);
    }

    static _build(id, options) {
        return new Promise(resolve => {
            let player;

            options = Object.assign({}, options || {});
            options['events'] = options['events'] || {};

            options['events']['onReady'] = function () {
                resolve(player);
            };

            player = new YT.Player(id, options);
        });
    }
}
