'use strict';

var cwpmFile = require('../file');
var colors = require('colors');
var AdmZip = require('adm-zip');
var fs = require('fs-extra');

function zipFolder(outFile, callback) {
    try {
        var zip = new AdmZip();

        function loadDefaultFiles() {
            // ['package.json', 'Help.pdf', 'Help.md']
            ['package.json', 'Help.md'].forEach(function (fileName) {
                console.log('write in zip file', fileName);
                zip.addFile(fileName, new Buffer(fs.readFileSync(fileName)), "no comment", "no attribute");
            });
            zip.writeZip(outFile);
            return callback && callback();
        }

        fs.readdir('./src', (err, files) => {
            files.forEach(file => {
                var fileName = './src/' + file;
                console.log('write in zip file', file, fileName);
                zip.addFile(file, new Buffer(fs.readFileSync(fileName, 'utf8')), "no comment", "no attribute");
            });
            var willSendthis = zip.toBuffer();
            loadDefaultFiles();
        });

    } catch (err) {
        console.log(err);
    }

}

function UnzipLayout(err, data, layoutName) {
    // var data = fs.readFileSync(name, 'binary');
    fs.writeFileSync('./remove_me_later.zip', data, 'binary');
    var zip = new AdmZip("./remove_me_later.zip");
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    cwpmFile.createDirIfNotExists("./webDesigner");
    cwpmFile.createDirIfNotExists("./webDesigner/custom");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace/libs/");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace/libs/" + layoutName);
    zip.extractAllTo("./webDesigner/custom/Marketplace/libs/" + layoutName, true);
    console.log((layoutName + " extracted").green);
    cwpmFile.removeFile('./remove_me_later.zip');
}

module.exports = {
    UnzipLayout,
    zipFolder,
}