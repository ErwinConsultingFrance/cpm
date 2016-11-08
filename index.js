#!/usr/bin/env node

(function() {
    'use strict';
    var fs = require('fs-extra'),
        argv = require('minimist')(process.argv.slice(2)),
        options = {},
        colors = require('colors'),
        cwpm = require('./libs');
    console.log(argv);

    // check out npm version --help
    function updateVersion(update, callback) {
        var npm = require('npm');
        npm.load({}, function(er) {
            if (er) {
                console.log('error on loading npm'.red, er);
            }
            npm.commands.version([update], function(err) {
                if (err) {
                    console.error('error on update version'.red, err);
                    return callback && callback(err);
                }
                return callback && callback(null);
            });
        });
    }

    function outputUsage() {
        var o = [];
        o.push('** Casewise layout package manager ** \n');
        o.push('Usage : \n');
        o.push('--name|--n <layoutName>\n');
        o.push('--template|--t <templateName:cwLayout(default)|ngLayout> \n');
        o.push('--package <patch|minor|major> \n');
        o.push('--register <evolve-layouts-path> \n');
        console.log(o.join(''));
    }


    if (Object.keys(argv).length === 1) {
        outputUsage();
    }

    options = {
        name: argv.name || argv.n || null,
        template: argv.template || argv.t || 'cwLayout',
        package: argv.package || null,
        install: argv.install || null,
        register: argv.register || null,
        init: argv.init || null
    };


    if (options.name !== null) {
        cwpm.generateLayout(options.name, options.template, function() {
            console.log('generation done.');
        });
    }



    if (options.package !== null) {
        options.package = (options.package === true ? 'patch' : options.package);
        console.log('do package', options.package);
        updateVersion(options.package, function(err) {
            if (!err) {
                console.log('version has been updated.'.green);
                var layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                cwpm.file.createDirIfNotExists('dist');
                var name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', layoutPackage['evolve-version'], '.zip'].join('');
                cwpm.zip.zipFolder(name, function() {
                    console.log('zip is done'.green);
                });
            }
        });
    }


    if (options.install !== null) {
        if (!fs.existsSync("./evolve.json")) {
            console.error('evolve.json is missing, impossible to continue'.red);
        } else {
            var evolveJson = JSON.parse(fs.readFileSync('./evolve.json', 'utf8'));
            cwpm.url.getJsonFile("https://raw.githubusercontent.com/casewise/evolve-layouts/master/layouts.json?" + Math.random(),function(err, layouts) {
                for (var layoutName in evolveJson.dependencies) {
                    if (evolveJson.dependencies.hasOwnProperty(layoutName)) {
                        console.log("get layout : " + layoutName);
                        if (layouts[layoutName] && layouts[layoutName]['evolve-versions']) {
                            var fileUrl = layouts[layoutName]['evolve-versions'][evolveJson['evolve-version']];
                            if (fileUrl !== undefined) {
                                console.log(('get file ' + fileUrl).green);
                                cwpm.url.getRawFileContent(fileUrl, cwpm.zip.UnzipLayout, layoutName);
                            } else {
                                console.error(['impossible to find ', layoutName, ' for current version of evolve which is ', evolveJson['evolve-version']].join('').red);
                            }
                        }
                    }
                }

            },null);
        }
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
        cwpm.file.writeInFile(path + "/README.md", output);
    }



    // if (options.init)
    if (options.register !== null) {
        if (!fs.existsSync(options.register + '/layouts.json')) {
            console.error((options.register + '/layouts.json is missing, impossible to continue').red);
        } else if (!fs.existsSync('package.json')) {
            console.error('package.json is missing, impossible to continue'.red);
        } else {
            var layoutsJson = JSON.parse(fs.readFileSync(options.register + '/layouts.json', 'utf8'));
            var layoutToAdd = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            if (!(layoutToAdd.hasOwnProperty("name") && layoutToAdd.hasOwnProperty("version") && layoutToAdd.hasOwnProperty("evolve-version"))) {
                console.log("package.json is not correct".red);
            } else {
                var layoutToAddPackage = layoutToAdd.name + '-v' + layoutToAdd.version + "-evolve-v" + layoutToAdd["evolve-version"] + ".zip";
                if (!fs.existsSync("dist/" + layoutToAddPackage)) {
                    console.log("no package available for your current version")
                } else {
                    if (!layoutsJson.hasOwnProperty(layoutToAdd.name) || layoutsJson.hasOwnProperty(layoutToAdd.name) && !layoutsJson[layoutToAdd.name].hasOwnProperty("evolve-versions")) {
                        layoutsJson[layoutToAdd.name] = {};
                        layoutsJson[layoutToAdd.name]["name"] = layoutToAdd.name;
                        layoutsJson[layoutToAdd.name]["repository"] = layoutToAdd.repository.url;
                        if (layoutToAdd.hasOwnProperty("description")) {
                            layoutsJson[layoutToAdd.name]["description"] = layoutToAdd["description"];
                        }
                        if (layoutToAdd.hasOwnProperty("wiki")) {
                            layoutsJson[layoutToAdd.name]["wiki"] = layoutToAdd["wiki"];
                        }
                        var gitPackageUrl = "https://github.com/casewise/evolve-layouts/raw/master/dist/" + layoutToAdd.name + "/" + layoutToAddPackage;
                        layoutsJson[layoutToAdd.name]["evolve-versions"] = {};
                        layoutsJson[layoutToAdd.name]["evolve-versions"][layoutToAdd["evolve-version"]] = gitPackageUrl;

                    } else {
                        if (layoutToAdd.hasOwnProperty("description")) {
                            layoutsJson[layoutToAdd.name]["description"] = layoutToAdd["description"];
                        }
                        if (layoutToAdd.hasOwnProperty("wiki")) {
                            layoutsJson[layoutToAdd.name]["wiki"] = layoutToAdd["wiki"];
                        }
                        var gitPackageUrl = "https://github.com/casewise/evolve-layouts/raw/master/dist/" + layoutToAdd.name + "/" + layoutToAddPackage;
                        layoutsJson[layoutToAdd.name]["evolve-versions"][layoutToAdd["evolve-version"]] = gitPackageUrl;
                    }
                    fs.copySync("dist/" + layoutToAddPackage, options.register + "/dist/" + layoutToAdd.name + "/" + layoutToAddPackage);

                    UpdateReadmeMD(options.register, layoutsJson)
                    cwpm.file.writeInFile(options.register + "/layouts.json", JSON.stringify(layoutsJson, null, 4));
                    console.log("package sucessfully register\nDon't forget to commit and push your modifications in evolve-layouts".green);

                }
            }
        }
    }

}());