// TODO LN: remove this in-memory store for a real DB
var squel = require('squel');

var db = require('../../db');

var USERS = {};

var COUNTER = 1;

var USER_TABLE = 'users',
    GOOGLE_USER_TABLE = 'google_users';

var SQL = {
    'get': squel.select()
        .from(USER_TABLE, 'u')
        .from(GOOGLE_USER_TABLE, 'g')
        .fields([ 'u.id', 'u.name', 'u.email', 'g.id', 'g.token' ])
        .where('u.google_id = g.id')
        .limit(1),
    'save': squel.insert()
        .into(USER_TABLE)
};

function User(data) {
    data = data || {};

    this.id = data.id || COUNTER++;
    this.name = data.name;
    this.email = data.email;

    this.google = {
        id: data.google && data.google.id || undefined,
        token: data.google && data.google.token || undefined
    };
}

User.findById = function (id, cb) {
    if (USERS[id]) {
        cb(undefined, new User(USERS[id]));
    } else {
        cb();
    }
};

User.findByGoogleId = function (googleId, cb) {
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
        name: this.name,
        google: this.google
    };

    cb(null, this);
};

// create the model for users and expose it to our app
module.exports = User;