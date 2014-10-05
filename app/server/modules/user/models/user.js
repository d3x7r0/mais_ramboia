// TODO LN: remove this in-memory store for a real DB
var USERS = {};

var COUNTER = 1;

function User(data) {
    data = data || {};

    this.id = data.id || COUNTER++;

    this.google = {
        id: data.google && data.google.id || undefined,
        email: data.google && data.google.email || undefined,
        token: data.google && data.google.token || undefined,
        name: data.google && data.google.email || undefined
    };
}

User.findById = function (id, cb) {
    if (USERS[id]) {
        cb(undefined, new User(USERS[id]));
    } else {
        cb();
    }
};

User.findOne = function (googleId, cb) {
    for (var k in USERS) {
        if (USERS.hasOwnProperty(k) && USERS[k].google && USERS[k].google.id === googleId) {
            cb(undefined, new User(USERS[k]));
            return;
        }
    }

    cb();
};

User.prototype.save = function (cb) {
    USERS[this.id] = {
        id: this.id,
        google: this.google
    };

    cb();
};

// create the model for users and expose it to our app
module.exports = User;