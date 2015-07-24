// Config
var SETTINGS = require('../../config').auth;

// load all the things we need
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/user');

function registerUser(token, refreshToken, profile, done) {

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function () {

        // try to find the user based on their google id
        User.findByGoogleId(profile.id, function (err, user) {
            if (err)
                return done(err);

            if (user) {

                // if a user is found, log them in
                return done(null, user);
            } else {
                // if the user isnt in our database, create a new user
                var newUser = new User();

                // set all of the relevant information
                newUser.name = profile.displayName;
                newUser.email = profile.emails[0].value; // pull the first email

                newUser.google.id = profile.id;
                newUser.google.token = token;

                // save the user
                newUser.save(function (err, u) {
                    if (err)
                        throw err;
                    return done(null, u);
                });
            }
        });
    });
}

function serializeUser(user, done) {
    done(null, user.id);
}

function deserializeUser(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
}

module.exports = function Setup(passport) {
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    passport.use('google', new GoogleStrategy({
        clientID: SETTINGS.google.clientId,
        clientSecret: SETTINGS.google.clientSecret,
        callbackURL: SETTINGS.google.callbackUrl
    }, registerUser));
};
