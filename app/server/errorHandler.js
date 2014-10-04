function render(res, statusCode, message) {
    res.status(statusCode);
    res.render('error.ejs', {
            it: {
                statusCode: statusCode,
                message: message
            }
        }
    );
}

module.exports = function (err, req, res, next) {
    console.error(err.stack);
    render(res, 500, "Internal Server Error");
};

module.exports.notFound = function (req, res) {
    render(res, 404, "Not Found");
};