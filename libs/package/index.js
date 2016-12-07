'use strict';
var fs = require('fs-extra')
var cwpmMarkDown = require('../markDown');
var cwpmRepository = require('../repository');
var cwpmZip = require('../zip');
var cwpmFile = require('../file');


function BuildPackage(err) {
    if (!err) {
        var layoutPackage, version, name;
        console.log('version has been updated.'.green);
        layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        cwpmFile.createDirIfNotExists('dist');
        version = layoutPackage['evolve-version'].replace(/ /g, '');
        name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', version, '.zip'].join('');
        cwpmZip.zipFolder(name, function () {
            console.log('zip is done'.green);
        });
    }
}

function DoPackage(optionsPackage) {
    console.log('do package', optionsPackage);
    cwpmRepository.updateVersion(optionsPackage, BuildPackage);
}

module.exports = {
    DoPackage
}