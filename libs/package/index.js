'use strict';
var fs = require('fs-extra')
var cwpmMarkDown = require('../markDown');
var cwpmRepository = require('../repository');
var cwpmZip = require('../zip');
var cwpmFile = require('../file');


function BuildPackage(err) {
    if (!err) {
        console.log('version has been updated.'.green);
        var layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        cwpmFile.createDirIfNotExists('dist');
        var name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', layoutPackage['evolve-version'], '.zip'].join('');
        cwpmZip.zipFolder(name, function() {
            console.log('zip is done'.green);
        });
    }
}



function DoPackage(optionsPackage) {
    cwpmMarkDown.exportReadmeMDtoPDF(optionsPackage);
    console.log('do package', optionsPackage);
    cwpmRepository.updateVersion(optionsPackage, BuildPackage);
}

module.exports = {
    DoPackage
}