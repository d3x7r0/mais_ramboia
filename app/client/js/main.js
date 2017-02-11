'use strict';
// Dependencies
import {ready, loadScript} from "./utils/dom";
import Player from "./widgets/player";

let player;

// Private methods
function init() {
    player = new Player('#player');

    player.play('dQw4w9WgXcQ', 180).then(function () {
        console.log("Playing");
    });

    // TODO: remove me
    player.mute();
    window.player = player;

    loadScript("/socket.io/socket.io.js").then(
        () => {
            const socket = window.io.connect('/');

            socket.on('connect', function () {
                console.log("Connected");
            });
        },
        err => console.error("Failed to load socket.io", err)
    );
}

// Public methods
export function start() {
    ready(init);
}

export function getPlayer() {
    return player;
}

export default {
    start: start,
    getPlayer: getPlayer
};