module.exports = function (err, req, res, next) {
    console.error(err.stack);
    respond(res, 500);
};

module.exports.notFound = function (req, res) {
    respond(res, 404);
};

function respond(res, statusCode) {
    res.status(statusCode).sendFile(`${__dirname}/views/${statusCode}.html`);
}