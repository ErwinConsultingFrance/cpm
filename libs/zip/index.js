'use strict';

var cwpmFile = require('../file');
var colors = require('colors');
var AdmZip = require('adm-zip');
var fs = require('fs-extra');
fs.rmrfSync = require('fs-extra').rmrfSync;
var archiver = require('archiver');

function zipFolder(outFile, callback) {
    // require modules 
     
    // create a file to stream archive data to. 
    var output = fs.createWriteStream(outFile);
    var archive = archiver('zip', {
        store: true // Sets the compression method to STORE. 
    });
     
    // listen for all archive data to be written 
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });
     
    // good practice to catch this error explicitly 
    archive.on('error', function(err) {
      throw err;
    });
     
     // pipe archive data to the file 
    archive.pipe(output);

    if (fs.existsSync('external')) {
        archive.directory('external/');
    }
    if (fs.existsSync('modules')) {
        archive.directory('modules/');
    }
    if (fs.existsSync('src')) {
        archive.directory('src/');
    }
    if (fs.existsSync('fonts')) {
        archive.directory('fonts/');
    }        
    archive.file('Help.pdf', { name: 'Help.pdf' });  
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize();
}





function UnzipLayout(err, data, layoutName) {
    // var data = fs.readFileSync(name, 'binary');
    fs.writeFileSync('./remove_me_later.zip', data, 'binary');
    var zip = new AdmZip("./remove_me_later.zip");
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    var destination = "./webDesigner/custom/Marketplace/libs/" + layoutName;

    cwpmFile.createDirIfNotExists("./webDesigner");
    cwpmFile.createDirIfNotExists("./webDesigner/custom");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace/libs/");
    cwpmFile.createDirIfNotExists("./webDesigner/custom/Marketplace/libs/" + layoutName);
    zip.extractAllTo("./webDesigner/custom/Marketplace/libs/" + layoutName, true);
    console.log((layoutName + " extracted").green);
    cwpmFile.removeFile('./remove_me_later.zip');

    if (fs.existsSync(destination + '/external')) {
        fs.readdir(destination + '/external', function(err, items) {
            console.log("adding sync libs : " + items);
            fs.copySync(destination + '/external',"webDesigner/js/external");
            fs.removeSync(destination  + '/external',"webDesigner/js/external");
        });
        
    }

    if (fs.existsSync(destination + '/modules')) {
        fs.readdir(destination + '/modules', function(err, items) {
            console.log("adding async libs : " + items);
            fs.copySync(destination + '/modules',"webDesigner/libs/modules");
            fs.removeSync(destination + '/modules',"webDesigner/libs/modules");
        });
        
    }

    if (fs.existsSync(destination + '/fonts')) {
        fs.readdir(destination + '/fonts', function(err, items) {
            console.log("adding fonts libs : " + items);
            fs.copySync(destination + '/fonts',"webDesigner/fonts");
            fs.removeSync(destination + '/fonts',"webDesigner/fonts");
        });
    }
}

module.exports = {
    UnzipLayout,
    zipFolder,
};