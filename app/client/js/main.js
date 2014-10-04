define(function (require) {
    'use strict';

    // Dependencies
    var console = require('utils/console'),
        when = require('promises');

    var _ = require('underscore'),
        $ = require('zepto');

    // Widgets
    var Tabs = require('widgets/tabs');

    // Public methods
    function start() {
        $(_init);
    }

    // Private methods
    function _init() {
        $('.js-tab-container').forEach(function(entry) {
            new Tabs(entry);
        });
    }

    return {
        start: start
    };
});