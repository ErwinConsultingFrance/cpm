(function () {
    'use strict';
    var fs = require('fs'),
        argv = require('minimist')(process.argv.slice(2)),
        options = {};
    console.log(argv);

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
                        writeInFile(layoutName + "/" + layoutName + ".js", getTemplateJsContent(template, layoutName));
                        touch(layoutName + "/" + layoutName + ".less");
                        touch(layoutName + "/" + layoutName + ".css");
                        touch(layoutName + "/" + layoutName + ".min.css");
                        writeInFile(layoutName + "/" + layoutName + ".layout.config.json", JSON.stringify(getJsonConfig(layoutName)));
                        writeInFile(layoutName + "/package.json", JSON.stringify(getPackageJsonConfig(layoutName)));

                        if (template === "ngLayout") {
                            writeInFile(layoutName + "/" + layoutName + ".ng.html", '<div ng-controller="' + layoutName + '"></div>');
                        }
                        return callback && callback();
                    }
                });
            }
        });
    }

    if (Object.keys(argv).length === 1) {
        outputUsage();
    }

    options = {
        name: argv.name || argv.n || null,
        template: argv.template || argv.t || 'cwLayout',
        package: argv.package || null
    };


    if (options.name !== null) {
        generateLayout(options.name, options.template, function () {
            console.log('generation done.');
        });
    }


    function addFileToZip(zip, fileName) {
        console.log(fileName);


    }

    function zipFolder(outFile) {
        try {
            var zip = new require('node-zip')();

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
        console.log('do package');
        var layoutPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        createDirIfNotExists('dist');
        var name = ['./dist/', layoutPackage.name, '-v', layoutPackage.version, '-evolve-v', layoutPackage['evolve-version'], '.zip'].join('');
        zipFolder(name);
    }


}());