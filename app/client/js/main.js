'use strict';
// Dependencies
import DOM from "./utils/dom";
import Player from "./widgets/player";
import {fetchJSON} from "./utils/fetch";

let player;

let playlistWrapper;

// Private methods
function init() {
    player = new Player('#player');

    playlistWrapper = DOM.find("#playlist").pop();

    // TODO: remove me
    // player.play('dQw4w9WgXcQ', 180).then(function () {
    //     console.log("Playing");
    // });
    //
    // player.mute();

    DOM.loadScript("/socket.io/socket.io.js").then(
        () => {
            const socket = window.io.connect('/');

            socket.on('playlist_change', updatePlaylist);
            socket.on('playlist_add', addVideo);
            socket.on('video_change', updateCurrentEntry);

            socket.on('reconnect', synchronizeState)
        },
        err => console.error("Failed to load socket.io", err)
    );

    synchronizeState();
}

function synchronizeState() {
    fetchJSON("/state").then(function (state) {
        console.debug(state);

        updatePlaylist(state);
        updateCurrentEntry(state);
    });
}

function updatePlaylist(state) {
    let entries = [].concat(state.entries || []);

    let scrollPosition = playlistWrapper.scrollTop;
    playlistWrapper.innerHTML = entries.map(renderPlaylistEntry).join("\n");
    playlistWrapper.scrollTop = scrollPosition;
}

function addVideo(state) {
    let scrollPosition = playlistWrapper.scrollTop;
    // TODO: Node.appendChild instead?
    playlistWrapper.innerHTML += renderPlaylistEntry(state.entry);
    playlistWrapper.scrollTop = scrollPosition;
}

function renderPlaylistEntry(entry) {
    return `<li class="playlist-entry" title="${entry.video.title}" data-id="${entry.video.id}">
                <img class="playlist-entry-background" src="${entry.video.thumbnail}"/>
                <h1 class="playlist-entry-title">${entry.video.title}</h1>
            </li>`;
}

function updateCurrentEntry(state) {
    if (state.currentEntry) {
        let serverTime = state.serverTime || +new Date(),
            timestamp = state.currentEntry.timestamp || 0;

        let offset = Math.round((serverTime - timestamp) / 1000); // youtube player needs seconds

        player.play(state.currentEntry.video.id, offset);
    } else {
        player.stop();
    }
}

// Public methods
export function start() {
    DOM.ready(init);
}

export function getPlayer() {
    return player;
}

export default {
    start: start,
    getPlayer: getPlayer
};