define(function (require) {
    'use strict';

    var domready = require('domready'),
        bonzo = require('bonzo'),
        qwery = require('qwery'),
        bean = require('bean');

    // Integrate the event handling into the DOM library
    var EVENT_METHODS = {
        on: "on",
        delegate: "add",
        one: "one",
        off: "off",
        trigger: "fire",
        cloneEvents: "clone",
        hover: "hover"
    };

    function integrate(fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);

            for (var i = 0; i < this.length; i++) {
                bean[fn].apply(null, [this.get(i)].concat(args));
            }

            return this;
        }
    }

    function addEventHandling() {
        var augs = {};

        for (var k in EVENT_METHODS) {
            if (EVENT_METHODS.hasOwnProperty(k)) {
                var fn = EVENT_METHODS[k];

                augs[k] = integrate(fn);
            }
        }

        bonzo.aug(augs);
    }

    // Init
    (function init() {
        // Set the selector engine
        bonzo.setQueryEngine(qwery);
        bean.setSelectorEngine(qwery);

        // Augment Bonzo
        addEventHandling();
        bonzo.aug({
            find: function find(selector) {
                var arr = [];

                for (var i = 0; i < this.length; i++) {
                    arr = arr.concat(qwery(selector, this.get(i)));
                }

                return bonzo(arr);
            }
        })
    })();

    // Export
    function dom(selector, context) {
        return bonzo(qwery(selector, context));
    }

    dom._bonzo = bonzo;
    dom._qwery = qwery;
    dom._bean = bean;

    // Expose static methods
    dom.ready = domready;

    dom.doc = bonzo.doc;
    dom.viewport = bonzo.viewport;
    dom.create = bonzo.create;

    return dom;
});