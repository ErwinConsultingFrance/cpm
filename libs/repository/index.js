'use strict';

var colors = require('colors');
var npm = require('npm');

// check out npm version --help
function updateVersion(update, callback) {

    if (update === 'current') {
        return callback && callback(null);
    }

    npm.load({}, function (er) {
        if (er) {
            console.log('error on loading npm'.red, er);
        }
        npm.commands.version([update], function (err) {
            if (err) {
                console.error('error on update version'.red, err);
                return callback && callback(err);
            }
            return callback && callback(null);
        });
    });
}

module.exports = {
    updateVersion
}