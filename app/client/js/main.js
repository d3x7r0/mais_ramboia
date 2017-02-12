'use strict';
// Dependencies
import DOM from "./utils/dom";
import Player from "./widgets/player";
import {fetchJSON} from "./utils/fetch";

let player;

let playlistWrapper,
    muteButton,
    elapsedTime,
    totalTime;

// Private methods
function init() {
    player = new Player('#player');

    playlistWrapper = DOM.find("#playlist").pop();
    muteButton = DOM.find("#video-mute").pop();
    elapsedTime = DOM.find("#video-time-current").pop();
    totalTime = DOM.find("#video-time-total").pop();

    muteButton.addEventListener('click', toggleMute);

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

    player.isMuted().then(updateMuteButton);

    updateTime();
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

function toggleMute() {
    player.toggleMute().then(updateMuteButton);
}

function updateMuteButton(state) {
    muteButton.innerHTML = state.muted ? "Unmute" : "Mute";
}

let lastUpdate = +new Date();

function updateTime() {

    let now = +new Date();

    // Update two times per second
    if (now - lastUpdate >= 500) {
        setTime();
    }

    requestAnimationFrame(updateTime);
}

function setTime() {
    player.getTime().then(time => {
        totalTime.innerHTML = sToTime(time.total);
        elapsedTime.innerHTML = sToTime(time.elapsed);
    });
}

function sToTime(duration) {
    let miliseconds = duration * 1000 | 0;

    let seconds = parseInt((miliseconds / 1000) % 60),
        minutes = parseInt((miliseconds / (1000 * 60)) % 60),
        hours = parseInt((miliseconds / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return [
        hours,
        minutes,
        seconds
    ].map(entry => {
        if (entry.toString().length < 2) {
            return "0" + entry;
        }

        return entry;
    }).join(":");
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