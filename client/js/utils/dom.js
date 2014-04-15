define(function (require) {
   'use strict';

    var bonzo = require('bonzo'),
        qwery = require('qwery');

    function dom(selector, context) {
        return bonzo(qwery(selector, context));
    }

    return dom;
});