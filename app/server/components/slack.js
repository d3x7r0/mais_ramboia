const Botkit = require('botkit');

const StatusHandler = require('../statusHandler');

// video providers
const PROVIDERS = [
    require("../providers/youtube")
];

const Playlist = require('./playlist');

function start(app, options) {
    // Init the bot controller
    const controller = Botkit.slackbot({
        stats_optout: true,
        debug: false
        // logLevel: 7
        //include "log: false" to disable logging
        //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });

    // Init the bot
    let bot = controller.spawn({
        token: options.slack.token,
        retry: 10
    });

    bot.startRTM(function (err) {
        if (err) {
            console.error(err);
            StatusHandler.setHealthy(false);
        } else {
            StatusHandler.setHealthy(true);
        }
    });

    // Setup webhook endpoints
    // controller.config.hostname = options.hostname;
    // controller.config.port = options.port;
    // controller.createWebhookEndpoints(app);
    const url = getURL(options);

    // TODO: allow multiple playlist instances
    const pl = Playlist.getInstance();

    // Set listeners
    PROVIDERS.forEach(provider => {
        controller.hears([provider.PATTERN], ['direct_mention'], function (bot, message) {

            provider.process(message)
                .then(addVideo(pl, bot, message))
                .catch(err => {
                    console.error(err.message || "unknown error", err);

                    bot.reply(message, `<@${message.user}> sorry, something went wrong`)
                });

            bot.startTyping(message);
        });
    });

    controller.hears(['skip'], ['direct_mention'], exactMatch, function (bot, message) {
        let voted = pl.voteToSkip(message.user);

        if (voted) {
            bot.reply(message, `<@${message.user}> voted to skip`);
        } else {
            bot.reply(message, `<@${message.user}>: No vote for you!`);
        }
    });

    controller.hears(['link me', 'linkme', 'url', 'link'], ['direct_mention', 'direct_message'], exactMatch, function (bot, message) {
        bot.reply(message, `<@${message.user}> the url is: <${url}>`);
    });

    controller.hears(['help', 'helpme', 'help me'], ['direct_mention', 'direct_message'], exactMatch, function (bot, message) {
        bot.reply(message, {
            attachments: [{
                fallback: "list of available commands",
                title: "Available commands",
                text: "*&lt;video_url&gt;*: will add a video url to the queue\n" +
                "*skip*: will vote to skip the current track\n" +
                "*link me*: will print the link to the player\n" +
                "*what’s playing?*: will print the currently playing song\n" +
                "*help*: shows this help screen\n" +
                "or just say something to me and I'll search youtube for a random video",
                mrkdwn_in: ["text"]
            }]
        });
    });

    controller.hears([/what[’|']?s playing\??/, /what is playing\??/, 'now playing'], ['direct_mention', 'direct_message'], function (bot, message) {
        let response = getNowPlayingMessage(
            message.user,
            pl.getCurrent()
        );

        bot.reply(message, response);
    });

    controller.on('direct_mention', function(bot, message) {
        // Search the first provider for a random video
        let provider = PROVIDERS[0];

        if (!provider) {
            console.error("No provider available. Aborting");
            return;
        }

        if (isEmpty(message.text)) {
            return;
        }

        provider.random(message)
            .then(addVideo(pl, bot, message))
            .catch(err => {
                console.error(err.message || "unknown error", err);

                let text = `<@${message.user}> `;

                if (err && err.message === "NotFound") {
                    text += "sorry, I couldn't find anything";
                } else {
                    text += "sorry, something went wrong";
                }

                bot.reply(message, text)
            });

        bot.startTyping(message);
    });

    pl.on('video_skip', function (entry, votes) {
        // Video was skipped, say it in all channels
        toAllChannels(bot, channels => {
            channels.map(entry => entry['id']).forEach(id => {
                bot.say({
                    text: `Skipping video <${entry.video.url}|${entry.video.title}>`,
                    attachments: [{
                        title: "Votes:",
                        text: votes.map(id => `<@${id}>`).join(", ")
                    }],
                    channel: id
                })
            });
        });
    });

    pl.on('video_change', function (entry) {
        // New video, say it in all channels
        toAllChannels(bot, channels => {
            let message = getNextVideoMessage(entry);

            channels.map(entry => entry['id']).forEach(id => {
                bot.say(Object.assign({}, message, {
                    channel: id
                }));
            });
        });
    });

    // controller.on('slash_command', function(bot, message) {
    //     console.log(message);
    // });

    controller.on('rtm_reconnect_failed', function () {
        StatusHandler.setHealthy(false);
        console.error("Reconnection to slack failed");
    });

    return controller;
}

function getURL(options) {
    if (options.url) {
        return options.url;
    }

    return `http://${options.hostname}${options.port !== 80 ? ":" + options.port : ""}` + (options.path || "");
}

function exactMatch(patterns, message) {
    return patterns.indexOf(message.text) !== -1;
}

function toAllChannels(bot, cb) {
    bot.api.channels.list({}, (err, data) => {
        if (err || data['ok'] !== true) {
            console.error("There was an error listing channels", err);
        } else {
            let channels = [].concat(data.channels || [])
                .filter(entry => entry['is_member']);

            cb(channels);
        }
    });
}

function getNextVideoMessage(entry) {
    if (entry) {
        return {
            text: `Now playing: <${entry.video.url}|${entry.video.title}> (submitted by <@${entry.user}>)`,
            unfurl_links: false,
            unfurl_media: false
        };
    } else {
        return {
            text: "No video to play next. Maybe you guys could give me a link or two."
        };
    }
}

function getNowPlayingMessage(userID, entry) {
    if (entry) {
        return {
            text: `<@${userID}> the video playing is <${entry.video.url}|${entry.video.title}>.`,
            unfurl_links: false,
            unfurl_media: false
        };
    } else {
        return {
            text: `<@${userID}> nothing's playing, maybe you can give me a video or two.`
        };
    }
}

function isEmpty(str) {
    return !str || str.length == 0 || str.replace(/\W/g, '').length === 0;
}

const ERRORS = {
    "Duplicate": "I don't like that video, give me something new.",
    "Live": "I can't play livestreams yet. This isn't twitch.",
    "NotEmbeddable": "Sorry, YouTube won't let me play that one.",
    "TooShort": "Give me something larger. It has to be HUGE!"
};

function addVideo(pl, bot, message) {
    return function onVideoReady(video) {
        return pl.addVideo(message.user, video).then(
            video => {
                console.info(`Video added to queue: ${video.id}`);

                bot.say({
                    text: `<@${message.user}>: added video to queue - <${video.url}|${video.title}>`,
                    unfurl_links: false,
                    unfurl_media: false,
                    channel: message.channel
                });
            },
            err => {
                if (err && err.message === "Rejected") {
                    console.info(`Video rejected: ${video.id}`);

                    let reason = err.reason && ERRORS[err.reason] || "";

                    bot.say({
                        text: `<@${message.user}>: Computer says no! ${reason}`,
                        channel: message.channel
                    });
                } else {
                    throw err || new Error("unknownError");
                }
            }
        );
    }
}

module.exports = {
    start: start
};