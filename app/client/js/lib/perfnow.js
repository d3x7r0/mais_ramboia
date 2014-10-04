// relies on Date.now() which has been supported everywhere modern for years.
// as Safari 6 doesn't have support for NavigationTiming, we use a Date.now() timestamp for relative values

// if you want values similar to what you'd get with real perf.now, place this towards the head of the page
// but in reality, you're just getting the delta between now() calls, so it's not terribly important where it's placed
(function () {

    // prepare base perf object
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }

    if (typeof window.performance.timing === 'undefined') {
        window.performance.timing = {};
    }

    if (!window.performance.timing.navigationStart) {
        window.performance.timing.navigationStart = +(new Date());
    }

    if (!window.performance.now) {
        window.performance.now = function now() {
            var time = +(new Date());
            return time - window.performance.timing.navigationStart;
        }
    }
})();