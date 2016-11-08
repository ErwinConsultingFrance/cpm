'use strict';

var request = require("request")

function getRawFileContent(fileUrl, callback,paramCallback) {
    request({
        url: fileUrl,
        encoding: null
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            return callback && callback(null, body,paramCallback);
        }
    })
}

function getJsonFile(fileUrl,callback) {
    request({
        url: fileUrl,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            return callback && callback(null, body);
        }
    })
}

module.exports = {
    getRawFileContent,
    getJsonFile
}