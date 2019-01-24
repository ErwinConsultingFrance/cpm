'use strict';
var fs = require('fs-extra');
var cwpmMarkDown = require('../markDown');
var cwpmRepository = require('../repository');
var cwpmZip = require('../zip');
var cwpmFile = require('../file');
var cwpmURL = require('../url');
var semver = require('semver');
var findVersions = require('find-versions');

function DoUpdate(layoutToUpdate,offline) {
    console.log("Updating : " + layoutToUpdate);
    cwpmURL.getJsonFile(offline,"https://raw.githubusercontent.com/ErwinConsultingFrance/evolve-layouts/master/layouts.json?" + Math.random(), function (err, layouts) {
        if (!layouts.hasOwnProperty(layoutToUpdate)) {
            console.error('the layout you try to update do not exist'.red);
            listALLlayouts(layouts);
            return;
        } else if (!fs.existsSync("./evolve.json")) {
            console.log('creating evolveJson is not created please use cpm install'.red);
        } else {
            var evolveJson = JSON.parse(fs.readFileSync('./evolve.json', 'utf8'));
           
            evolveJson.dependencies[layoutToUpdate] = "^0.0.1";
            update(evolveJson, layouts,layoutToUpdate,offline);
            cwpmFile.writeInFile("./evolve.json", JSON.stringify(evolveJson, null, 4));

        }

    });
}

function listALLlayouts(layouts) {
    console.log('here is the list of all layouts'.green);
    for (var layout in layouts) {
        if (layouts.hasOwnProperty(layout)) {
            console.log((layouts[layout].name + ' : ' + layouts[layout].description));
        }
    }
};

function update(evolveJson,layouts,layoutName,offline) {
    console.log("get layout : " + layoutName);
    if (layouts[layoutName] && layouts[layoutName]['evolve-versions']) {
        var fileUrl = findSatisfayingVersion(layouts[layoutName]['evolve-versions'], evolveJson['evolve-version']);
        if (fileUrl !== undefined && fileUrl !== null) {
            cwpmURL.getRawFileContent(fileUrl, cwpmZip.UnzipLayout, layoutName,offline);
        } else {
            console.error(['impossible to find ', layoutName, ' for current version of evolve which is ', evolveJson['evolve-version']].join('').red);
        }
    }
};

function findSatisfayingVersion(layout, versionToSatisfy) {
    for (var version in layout) {
        if (layout.hasOwnProperty(version)) {
            var sVersionToSatisfys = findVersions(versionToSatisfy, {
                loose: true
            });
            console.log('check version ', sVersionToSatisfys.toString(), ' satisfies ', version, semver.satisfies(sVersionToSatisfys.toString(), version));
            if (semver.satisfies(sVersionToSatisfys.toString(), version) === true) {
                return layout[version];
            }
        }
    }
    return null;
};




function getEvolveVersion() {
    //const vi = require('win-version-info')
    //return vi("evolveDesigner.exe").FileVersion;
};

module.exports = {
    DoUpdate
};