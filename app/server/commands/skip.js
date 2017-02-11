
function process(payload) {
    console.info(`Skip command by ${payload.user_id}`);

    return "Skipping...";
}

function canProcess(text) {
    return text === "skip";
}

module.exports = {
    canProcess: canProcess,
    process: process
};