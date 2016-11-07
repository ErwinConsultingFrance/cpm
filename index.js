#!/usr/bin/env node

(function() {
    'use strict';
    var fs = require('fs-extra'),
        argv = require('minimist')(process.argv.slice(2)),
        options = {},
        colors = require('colors');
    // zip = new require('node-zip')();

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
        var fileContent = fs.readFileSync(__dirname + "/templates/template." + template + ".js", 'utf8');
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
                                writeInFile(layoutName + "/src/" + layoutName + ".js", getTemplateJsContent(template, layoutName));
                                touch(layoutName + "/src/" + layoutName + ".less");
                                touch(layoutName + "/src/" + layoutName + ".css");
                                touch(layoutName + "/src/" + layoutName + ".min.css");
                                writeInFile(layoutName + "/src/" + layoutName + ".layout.config.json", JSON.stringify(getJsonConfig(layoutName)));
                                writeInFile(layoutName + "/package.json", JSON.stringify(getPackageJsonConfig(layoutName)));

                                if (template === "ngLayout") {
                                    writeInFile(layoutName + "/" + layoutName + ".ng.html", '<div ng-controller="' + layoutName + '"></div>');
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
        generateLayout(options.name, options.template, function() {
            console.log('generation done.');
        });
    }
    var AdmZip = require('adm-zip');

    function zipFolder(outFile, callback) {
        try {
            var zip = new AdmZip();
            fs.readdir('./src', (err, files) => {
                files.forEach(file => {
                    var fileName = './src/' + file;
                    console.log('write in zip file', file, fileName);
                    zip.addFile(file, new Buffer(fs.readFileSync(fileName, 'utf8')), "no comment", "no attribute");
                });
                var willSendthis = zip.toBuffer();
                zip.writeZip(outFile);
                return callback && callback();
            });
        } catch (err) {
            console.log(err);
        }

    }

    function createDirIfNotExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    if (options.package !== null) {
        options.package = (options.package === true ? 'patch' : options.package);
        console.log('do package', options.package);
        updateVersion(options.package, function(err) {
            if (!err) {
                console.log('version has been updated.'.green);
                var layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                createDirIfNotExists('dist');
                var name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', layoutPackage['evolve-version'], '.zip'].join('');
                zipFolder(name, function() {
                    console.log('zip is done'.green);
                });
            }
        });
    }


    var request = require("request")


    function getLayoutsList(callback) {
        var url = "https://raw.githubusercontent.com/casewise/evolve-layouts/master/layouts.json?" + Math.random();
        console.log(url);
        request({
            url: url,
            json: true
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                return callback && callback(null, body);
            }
        })
    }


    function getRawFileContent(fileUrl, callback) {
        console.log(fileUrl);
        request({
            url: fileUrl,
            encoding: null
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                return callback && callback(null, body);
            }
        })
    }


    if (options.install !== null) {
        if (!fs.existsSync("./evolve.json")) {
            console.error('evolve.json is missing, impossible to continue'.red);
        } else {
            var evolveJson = JSON.parse(fs.readFileSync('./evolve.json', 'utf8'));
            getLayoutsList(function(err, layouts) {
                for (var layoutName in evolveJson.dependencies) {
                    if (evolveJson.dependencies.hasOwnProperty(layoutName)) {
                        console.log("get layout : " + layoutName);
                        if (layouts[layoutName] && layouts[layoutName]['evolve-versions']) {
                            var fileUrl = layouts[layoutName]['evolve-versions'][evolveJson['evolve-version']];
                            if (fileUrl !== undefined) {
                                console.log(('get file' + fileUrl).green);
                                getRawFileContent(fileUrl, function(err, data) {
                                    // var data = fs.readFileSync(name, 'binary');
                                    fs.writeFileSync('./remove_me_later.zip', data, 'binary');
                                    var zip = new AdmZip("./remove_me_later.zip");
                                    var zipEntries = zip.getEntries(); // an array of ZipEntry records
                                    createDirIfNotExists("./webDesigner");
                                    createDirIfNotExists("./webDesigner/custom");
                                    createDirIfNotExists("./webDesigner/custom/Marketplace");
                                    createDirIfNotExists("./webDesigner/custom/Marketplace/libs/");
                                    createDirIfNotExists("./webDesigner/custom/Marketplace/libs/cwLayouts");
                                    createDirIfNotExists("./webDesigner/custom/Marketplace/libs/cwLayouts/" + layoutName);
                                    zip.extractAllTo("./webDesigner/custom/Marketplace/libs/cwLayouts/" + layoutName, true);
                                });
                            } else {
                                console.error(['impossible to find ', layoutName, ' for current version of evolve which is ', evolveJson['evolve-version']].join('').red);
                            }
                        }
                    }
                }

            });
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
        writeInFile(path + "/README.md", output);
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
                    writeInFile(options.register + "/layouts.json", JSON.stringify(layoutsJson, null, 4));
                    console.log("package sucessfully register\nDon't forget to commit and push your modifications in evolve-layouts".green);

                }
            }
        }
    }

}());