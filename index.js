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

    function generateLayout(layoutName, callback) {
        fs.stat(layoutName, function (err, stats) {
            if (err !== null) {
                fs.mkdir(layoutName, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            // console.log(err, stats);
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