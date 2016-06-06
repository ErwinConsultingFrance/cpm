(function () {
    'use strict';
    var fs = require('fs'),
        argv = require('minimist')(process.argv.slice(2));
    console.log(argv);

    function outputUsage() {
        var o = [];
        o.push('** Casewise layout package manager ** \n');
        o.push('Usage : \n');
        o.push('--generate-layout|--gl <layoutName>\n');
        console.log(o.join(''));
    }

    function touch(filepath) {
        console.info('touch file', filepath);
        fs.closeSync(fs.openSync(filepath, 'w'));
    }

    function writeInFile(filepath, content) {
        console.info('write in file', filepath);
        fs.writeFile(filepath, content, function (err) {
            if (err) return console.log(err);
        });
    }

    function getJsonConfig(layoutName) {
        return {
            'Name': layoutName,
            'DisplayName': layoutName,
            'Description': layoutName,
            'JavaScriptClassName': layoutName
        }
    }

    function getPackageJsonConfig(layoutName) {
        return {
            'name': layoutName,
            'description': layoutName,
            'version': '0.0.0'
        }
    }

    function getTemplateJsContent(layoutName) {
        var fileContent = fs.readFileSync(__dirname + "/templates/template.js", 'utf8');
        return fileContent.replace(/cwTemplateLayout/g, layoutName);
    }

    function generateLayout(layoutName, callback) {
        fs.stat(layoutName, function (err, stats) {
            if (err !== null) {
                fs.mkdir(layoutName, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        writeInFile(layoutName + "/" + layoutName + ".js", getTemplateJsContent(layoutName));
                        touch(layoutName + "/" + layoutName + ".less");
                        writeInFile(layoutName + "/" + layoutName + ".layout.config.json", JSON.stringify(getJsonConfig(layoutName)));
                        writeInFile(layoutName + "/package.json", JSON.stringify(getPackageJsonConfig(layoutName)));

                    }
                });
            }
        });
    }

    if (Object.keys(argv).length === 1) {
        outputUsage();
    }

    if (argv['generate-layout']) {
        generateLayout(argv['generate-layout']);
    }
    if (argv.gl) {
        generateLayout(argv.gl);
    }

}());