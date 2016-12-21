'use strict';

var request = require("request");

function getRawFileContent(fileUrl, callback,paramCallback) {
    request({
        url: fileUrl,
        encoding: null
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            return callback && callback(null, body,paramCallback);
        } else {
            return error;
        }
    });
}

function getJsonFile(fileUrl,callback) {
    request({
        url: fileUrl,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            return callback && callback(null, body);
        } else {
            return error;
        }
    });
}

module.exports = {
    getRawFileContent,
    getJsonFile
};