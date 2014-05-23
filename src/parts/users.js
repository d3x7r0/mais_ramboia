/* jshint nodejs:true */

var _ = require('underscore');

var _users = {};

function _getUsers(room) {
    _users[room] = _users[room] || [];

    return _users[room];
}

function _removeUser(room, userId) {
    _users[room] = _getUsers(room).filter(
        differs('id', userId)
    );
}

function _addUser(room, userId, connectionId) {
    var user = _getUser(room, userId);

    if (!user) {
        _getUsers(room).push({
            id: userId,
            connections: [
                connectionId
            ]
        });
    } else {
        user.connections.push(connectionId);
    }

    return user;
}

function _getUser(room, userId) {
    var user = _getUsers(room).filter(
        equals('id', userId)
    );

    return user && user[0];
}

function _getUserByConnection(room, connectionId) {
    var user = _getUsers(room).filter(
        contains('connections', connectionId)
    );

    return user && user[0];
}

function _removeConnection(room, connectionId) {
    var user = _getUserByConnection(room, connectionId);

    if (user) {
        user.connections = user.connections.filter(
            equals(connectionId)
        );

        if (user.connections.length === 0) {
            _removeUser(room, user.id);
        }
    }
}

// Filter helpers
function equals(attr, value) {
    if (arguments.length == 2) {
        return function (entry) {
            return entry[attr] === value
        };
    } else {
        return function (entry) {
            return entry === attr;
        };
    }
}

function differs(attr, value) {
    return function (entry) {
        return entry[attr] === value
    };
}

function contains(attr, value) {
    return function (entry) {
        return (entry[attr] || []).filter(
            equals(value)
        ).length;
    }
}

module.exports = {
    getUsers: _getUsers,
    getUser: _getUser,
    getUserByConnection: _getUserByConnection,
    addUser: _addUser,
    removeUser: _removeUser,
    removeConnection: _removeConnection
};
