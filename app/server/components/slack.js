const Botkit = require('botkit');

const StatusHandler = require('../statusHandler');

// video providers
const PROVIDERS = [
    require("../providers/youtube")
];

const Playlist = require('./playlist');

function start(server, options) {
    // Init the bot controller
    const controller = Botkit.slackbot({
        stats_optout: true,
        debug: false
        // logLevel: 7
        //include "log: false" to disable logging
        //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });

    // Init the bot
    controller.spawn({
        token: options.slack.token,
        retry: 10
    }).startRTM(function (err) {
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
    // controller.createWebhookEndpoints(server);

    const url = `http://${options.hostname}${options.port !== 80 ? ":" + options.port : ""}` + (options.path || "");

    // Set listeners
    PROVIDERS.forEach(provider => {
        controller.hears([provider.PATTERN], ['direct_mention'], function (bot, message) {

            // TODO: add video to queue and notify channel
            provider.process(message)
                .then(
                    video => {
                        let added = Playlist.getInstance().addVideo(message.user, video);

                        if (added) {
                            console.info(`Video added to queue: ${video.id}`);

                            bot.say({
                                text: `<@${message.user}>: added video to queue - <https://${message.match[0]}|${video.title}>`,
                                unfurl_links: true,
                                unfurl_media: true,
                                channel: message.channel
                            });
                        } else {
                            console.info(`Video rejected: ${video.id}`);

                            bot.say({
                                text: `<@${message.user}>: Computer says no!`,
                                channel: message.channel
                            });
                        }
                    }
                )
                .catch(console.error.bind(console));

            bot.startTyping(message);
        });
    });

    controller.hears(['skip'], ['direct_mention'], function (bot, message) {
        // TODO: implement vote to skip
        bot.reply(message, `<@${message.user}> voted to skip`);
    });

    controller.hears(['link me'], ['direct_mention', 'direct_message'], function (bot, message) {
        // TODO: implement vote to skip
        bot.reply(message, `<@${message.user}> the url is: <${url}>`);
    });

    controller.hears(['help'], ['direct_mention', 'direct_message'], function (bot, message) {
        bot.reply(message, {
            attachments: [
                {
                    fallback: "list of available commands",
                    title: "Available commands",
                    text: "*&lt;video_url&gt;*: will add a video url to the queue\n" +
                    "*skip*: will vote to skip the current track\n" +
                    "*link me*: will print the link to the player\n" +
                    "*help*: shows this help screen",
                    mrkdwn_in: ["text"]
                }
            ]
        });
    });

    // controller.on('slash_command', function(bot, message) {
    //     console.log(message);
    // });

    controller.on('rtm_reconnect_failed', function () {
        StatusHandler.setHealthy(false);
        console.error("Reconnection to slack failed");
    })
}


module.exports = {
    start: start
};