module.exports = function (settings) {

    function validate(req, res, next) {
        if (!req.body) {
            console.warn("Missing body in request");
            res.sendStatus(400);
            return;
        }

        if (!settings['slack']['token']) {
            console.error("Missing token in server configuration");
            res.status(500).send("Missing token in server configuration");
            return;
        }

        if (!validateProperty("token", req, res)) {
            return;
        }

        if (!validateProperty('channel_name', req, res)) {
            return;
        }

        if (!validateProperty('channel_id', req, res)) {
            return;
        }

        next();
    }

    function validateProperty(propertyName, req, res) {
        if (!settings['slack'][propertyName]) {
            return true;
        }

        if (!req.body[propertyName]) {
            console.warn(`Missing ${propertyName} in request body`);
            res.sendStatus(400);
            return false;
        }

        if (req.body[propertyName] !== settings['slack'][propertyName]) {
            console.warn(`Invalid ${propertyName} in request body`);
            res.sendStatus(403);
            return false;
        }

        return true;
    }

    return validate;
};
