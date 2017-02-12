// populate commands
const COMMANDS = [
    require('./skip'),
    require('./add-video')
];

function process(payload) {
    payload = payload || {};

    return parse(payload.text)(payload);
}

function parse(text) {
    text = text || "";
    text = text.split(" ").pop() || "";

    const command = COMMANDS
        .filter(entry => entry.canProcess(text))
        .map(entry => entry.process)
        .pop();

    return command || help;
}

function help(payload) {
    return `I can't let you do that ${payload.user_name || "Dave"}...`;
}

module.exports = {
    process: process
};