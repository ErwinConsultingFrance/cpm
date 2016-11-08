'use strict';

var cwpmFile = require('../file');
var colors = require('colors');
var fs = require('fs-extra');


function getJsonConfig(layoutName) {
    return {
        'Name': layoutName,
        'DisplayName': layoutName,
        'Description': layoutName,
        'JavaScriptClassName': layoutName
    };
}

function getPackageJsonConfig(layoutName) {
    return {
        'name': layoutName,
        'description': layoutName,
        'version': '0.0.0',
        'main': '',
        'scripts': {
            'test': ''
        },
        'repository': {
            'type': "git",
            'url': ''
        },
        'author': '',
        'license': 'MIT',
        'bugs': {
            'url': ""
        },
        'homepage': "",
        'wiki': "",
        'evolve-version': "0.0"
    };
}

function getTemplateJsContent(template, layoutName) {
    var fileContent = fs.readFileSync(__dirname + "../../../templates/template." + template + ".js", 'utf8');
    fileContent = fileContent.replace(/cwTemplateLayout/g, layoutName);
    return fileContent;
}

function generateLayout(layoutName, template, callback) {
    fs.stat(layoutName, function(err) {
        if (err !== null) {
            fs.mkdir(layoutName, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    fs.mkdir(layoutName + "/src", function(err) {
                        if (err) {
                            console.error(err);
                        } else {
                            cwpmFile.writeInFile(layoutName + "/src/" + layoutName + ".js", getTemplateJsContent(template, layoutName));
                            cwpmFile.touch(layoutName + "/src/" + layoutName + ".less");
                            cwpmFile.touch(layoutName + "/src/" + layoutName + ".css");
                            cwpmFile.touch(layoutName + "/src/" + layoutName + ".min.css");
                            cwpmFile.writeInFile(layoutName + "/src/" + layoutName + ".layout.config.json", JSON.stringify(getJsonConfig(layoutName),null,4));
                            cwpmFile.writeInFile(layoutName + "/package.json", JSON.stringify(getPackageJsonConfig(layoutName),null,4));

                            if (template === "ngLayout") {
                                cwpmFile.writeInFile(layoutName + "/" + layoutName + ".ng.html", '<div ng-controller="' + layoutName + '"></div>');
                            }
                            return callback && callback();
                        }
                    });
                }
            });
        } else {
            console.log("layout already exist in folder");
        }
    });
}

function UpdateReadmeMD(path, layoutsJson) {
    var output = "#List of layouts\n";
    for (var layout in layoutsJson) {
        if (layoutsJson.hasOwnProperty(layout)) {
            output += "##" + layout + ": \n";
            if (layoutsJson[layout].hasOwnProperty("description")) {
                output += "- " + layoutsJson[layout].description + "\n";
            }
            if (layoutsJson[layout].hasOwnProperty("wiki")) {
                output += "- " + layoutsJson[layout].wiki + "\n";
            }
            if (layoutsJson[layout].hasOwnProperty("evolve-versions")) {
                output += "- Compatibility : Evolve " + Object.keys(layoutsJson[layout]["evolve-versions"]) + "\n\n";
            }
        }
    }
    console.log(output)
    cwpmFile.writeInFile(path + "/README.md", output);
}

module.exports = {
    UpdateReadmeMD,
    generateLayout,
    getTemplateJsContent,
    getPackageJsonConfig,
    getJsonConfig
}