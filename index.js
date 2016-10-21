#!/usr/bin/env node

(function () {
    'use strict';
    var fs = require('fs'),
        argv = require('minimist')(process.argv.slice(2)),
        options = {},
        colors = require('colors'),
        zip = new require('node-zip')();



    console.log(argv);


    // check out npm version --help
    function updateVersion(update, callback) {
        var npm = require('npm');
        npm.load({}, function (er) {
            if (er) {
                console.log('error on loading npm'.red, er);
            }
            npm.commands.version([update], function (err) {
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
        console.log(o.join(''));
    }

    function touch(filepath) {
        console.info('touch file', filepath);
        fs.closeSync(fs.openSync(filepath, 'w'));
    }

    function writeInFile(filepath, content) {
        console.info('write in file', filepath);
        fs.writeFile(filepath, content, function (err) {
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
            'version': '0.0.0'
        };
    }

    function getTemplateJsContent(template, layoutName) {
        var fileContent = fs.readFileSync(__dirname + "/templates/template." + template + ".js", 'utf8');
        fileContent = fileContent.replace(/cwTemplateLayout/g, layoutName);
        return fileContent;
    }

    function generateLayout(layoutName, template, callback) {
        fs.stat(layoutName, function (err) {
            if (err !== null) {
                fs.mkdir(layoutName, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        fs.mkdir(layoutName + "/src", function (err) {
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
        install: argv.install || null
    };


    if (options.name !== null) {
        generateLayout(options.name, options.template, function () {
            console.log('generation done.');
        });
    }

    function zipFolder(outFile, callback) {
        try {
            fs.readdir('./src', (err, files) => {
                files.forEach(file => {
                    var fileName = './src/' + file;
                    console.log('write in zip file', file, fileName);
                    zip.file(file, fs.readFileSync(fileName, 'utf8'));
                });
                var data = zip.generate({
                    base64: false,
                    compression: 'DEFLATE'
                });
                fs.writeFileSync(outFile, data, 'binary');
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
        updateVersion(options.package, function (err) {
            if (!err) {
                console.log('version has been updated.'.green);
                var layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                createDirIfNotExists('dist');
                var name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', layoutPackage['evolve-version'], '.zip'].join('');
                zipFolder(name, function () {
                    console.log('zip is done'.green);
                });
            }
        });
    }

    if (options.install !== null) {
        if (!fs.existsSync("./evolve.json")) {
            console.error('evolve.json is missing, impossible to continue'.error);
        }
    }


}());