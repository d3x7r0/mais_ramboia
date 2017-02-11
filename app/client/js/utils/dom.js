import Promise from "bluebird";

export function find(selector) {
    const entries = document.querySelectorAll(selector);

    return Array.prototype.slice.call(entries);
}

export function trigger(el, eventName, data) {
    let event;

    if (window.CustomEvent) {
        event = new CustomEvent(eventName, {detail: data});
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, true, true, {some: data});
    }

    el.dispatchEvent(event);
}

export function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

export function loadScript(src) {
    return new Promise(resolve => {
        const tag = document.createElement('script');

        tag.onload = () => {
            resolve();
        };

        tag.onerror = err => {
            throw err;
        };

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        tag.src = src;
    });
}

export default {
    find: find,
    trigger: trigger,
    ready: ready,
    loadScript: loadScript
};