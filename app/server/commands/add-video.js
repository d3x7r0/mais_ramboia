const PROVIDERS = [
    require('../providers/youtube')
];

function process(payload) {
    const provider = findProvider(payload.text);

    // TODO: add to playlist and call slack callback with details
    provider.process(payload).then(
        console.log.bind(console),
        console.error.bind(console)
    );

    return "Adding video...";
}

function canProcess(text) {
    return findProvider(text) !== undefined;
}

function findProvider(text) {
    return PROVIDERS.find(provider => provider.canProcess(text))
}

module.exports = {
    canProcess: canProcess,
    process: process
};