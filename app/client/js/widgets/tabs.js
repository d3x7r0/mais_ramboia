define(function (require) {
    "use strict";

    var _ = require('lodash'),
        $ = require('zepto');

    var Tabs = function ($el, opts) {
        this._$el = $($el);

        this._$entries = this._$el.find('.js-entry');

        this._$tabs = this._$entries.map(function (idx, entry) {
            return $(_findTarget(entry));
        });

        var current = this._$el.attr('data-visible') || _findTarget(this._$entries.first());

        this.setTab(current);

        this._onTabClick = _.bind(_onTabClick, this);

        $(this._$el).on(
            'click',
            '.js-entry',
            this._onTabClick
        );
    };

    Tabs.prototype.setTab = function (selector) {
        this._$tabs
            .removeClass('selected')
            .filter(selector)
            .addClass('selected');

        this._$entries
            .removeClass('selected')
            .filter(function() {
                return _findTarget(this) === selector;
            })
            .addClass('selected');

        this._$el.attr('data-visible', selector);
    };

    var _onTabClick = function (e) {
        e.preventDefault();

        this.setTab(
            _findTarget(e.target)
        );
    };

    function _findTarget($el) {
        $el = $($el);

        if (!$el.is('a')) {
            $el = $el.find('a');
        }

        return $el.attr('href');
    }

    return Tabs;
});