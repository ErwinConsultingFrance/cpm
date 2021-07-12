'use strict';

var request = require("request");
var fs = require('fs-extra');

function getRawFileContent(fileUrl, callback,paramCallback,offline) {
    if(offline === undefined) {
        console.log(('get file ' + fileUrl).green);
        request({
            url: fileUrl,
            encoding: null
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(('file received' + fileUrl).green);
                return callback && callback(null, body,paramCallback);
            } else {
                return error;
            }
        });
    }
    else {

        var filePath,split = fileUrl.split("/raw/master");
        if(split.length > 1) filePath = split[1];
        console.log(('get file ' + offline + filePath).green);
        fs.copySync(offline + filePath, "./remove_me_later.zip");
        return callback(null,null,paramCallback);        
    }
}

function getJsonFile(offline,fileUrl,callback) {
    console.log(offline);
     console.log(fileUrl); 
    if(offline === undefined) {
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
    } else {
        return callback(null,JSON.parse(fs.readFileSync(offline + "/layouts.json", 'utf8')));
    }
   
}

module.exports = {
    getRawFileContent,
    getJsonFile
};