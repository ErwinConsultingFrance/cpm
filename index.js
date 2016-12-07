#!/usr/bin/env node

(function() {
    'use strict';
    var fs = require('fs-extra'),
        argv = require('minimist')(process.argv.slice(2)),
        options = {},
        colors = require('colors'),
        cwpm = require('./libs');
    console.log(argv);



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
        cwpm.DoPackage(options.package);
    }


    if (options.install !== null) {
        cwpm.install(options.install);
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
                var layoutToAddPackage = layoutToAdd.name + '-v' + layoutToAdd.version + "-evolve-v" + layoutToAdd["evolve-version"].replace(/ /g,'') + ".zip";
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

                    cwpm.markDown.UpdateReadmeMD(options.register, layoutsJson)
                    cwpm.file.writeInFile(options.register + "/layouts.json", JSON.stringify(layoutsJson, null, 4));
                    console.log("package sucessfully register\nDon't forget to commit and push your modifications in evolve-layouts".green);

                }
            }
        }
    }

}());