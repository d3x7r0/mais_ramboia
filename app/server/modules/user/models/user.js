// load the things we need
var bcrypt = require('bcrypt');

// TODO LN: remove this in-memory store for a real DB
var USERS = {};

var COUNTER = 1;

function User(data) {
    data = data || {};

    this.id = data.id || COUNTER++;

    this.local = {
        email: data.local && data.local.email || undefined,
        password: data.local && data.local.password || undefined
    };
}

User.findById = function (id, cb) {
    if (USERS[id]) {
        cb(undefined, new User(USERS[id]));
    } else {
        cb();
    }
};

User.findOne = function (email, cb) {
    for (var k in USERS) {
        if (USERS.hasOwnProperty(k) && USERS[k].local.email === email) {
            cb(undefined, new User(USERS[k]));
            return;
        }
    }

    cb();
};

// methods ======================
// generating a hash
User.prototype.generateHash = function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.prototype.validPassword = function validPassword(password) {
    return bcrypt.compareSync(password, this.local.password);
};

User.prototype.save = function (cb) {
    USERS[this.id] = {
        id: this.id,
        local: this.local
    };

    cb();
};

// create the model for users and expose it to our app
module.exports = User;