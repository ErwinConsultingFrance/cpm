'use strict';

var fs = require('fs-extra')

function touch(filepath) {
    console.info('touch file', filepath);
    fs.closeSync(fs.openSync(filepath, 'w'));
}

function writeInFile(filepath, content) {
    console.info('write in file', filepath);
    fs.writeFile(filepath, content, function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

function createDirIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}


module.exports = {
    touch,
    writeInFile,
    createDirIfNotExists
}

