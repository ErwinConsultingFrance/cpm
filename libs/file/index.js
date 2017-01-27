'use strict';

var fs = require('fs-extra');

function touch(filepath) {
    console.info('touch file', filepath);
    fs.closeSync(fs.openSync(filepath, 'w'));
}

function writeInFile(filepath, content) {
    fs.writeFileSync(filepath, content);
}

function createDirIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function removeFile(file) {
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}


module.exports = {
    touch,
    writeInFile,
    createDirIfNotExists,
    removeFile
};