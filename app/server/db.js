var SETTINGS = require('./config');

var squel = require('squel'),
    pg = require('pg');

squel.useFlavour('postgres');

function getConnection(cb) {
    pg.connect(SETTINGS.db, cb);
}

// Exports
module.exports = {
    getConnection: getConnection
};