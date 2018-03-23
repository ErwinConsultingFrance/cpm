'use strict';

var cwpmFile = require('../file');
var colors = require('colors');
var AdmZip = require('adm-zip');
var fs = require('fs-extra');
fs.rmrfSync = require('fs-extra').rmrfSync;
var archiver = require('archiver');

function zipFolder(outFile,layoutName, callback) {
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

    if (fs.existsSync('angularHTMLayout')) {
        console.log("Archive angularHTMLayout");
        archive.directory('Evolve/Data/Common/html/');
    }
    if (fs.existsSync('external')) {
        console.log("Archive external");
        archive.directory('external/','Evolve/Site/bin/webDesigner/js/external/');
    }
    if (fs.existsSync('modules')) {
        console.log("Archive modules");
        archive.directory('modules/','Evolve/Site/bin/webDesigner/libs/modules/');
    }
    if (fs.existsSync('src')) {
        console.log("Archive src");
        archive.directory('src/','Evolve/Site/bin/webDesigner/custom/Marketplace/libs/' + layoutName + '/src/');
    }
    if (fs.existsSync('fonts')) {
        console.log("Archive fonts");
        archive.directory('fonts/','Evolve/Site/bin/webDesigner/fonts/');
    }    
    if (fs.existsSync('themes')) {
        console.log("Archive themes");
        archive.directory('themes/','Evolve/Site/bin/webDesigner/themes/');
    }     
    console.log("Archive help");
    archive.directory('help/','Evolve/Site/bin/webDesigner/custom/Marketplace/libs/' + layoutName);
   
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize();
}





function UnzipLayout(err, data, layoutName) {
    // var data = fs.readFileSync(name, 'binary');
    if(data !== null) fs.writeFileSync('./remove_me_later.zip', data, 'binary');
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

    if (fs.existsSync(destination + '/Evolve')) {
        fs.copySync(destination + '/Evolve',"../../../Evolve");
        fs.removeSync(destination + '/Evolve');
    };

    if (fs.existsSync(destination + '/external')) {
        fs.readdir(destination + '/external', function(err, items) {
            console.log("adding sync libs : " + items);
            fs.copySync(destination + '/external',"webDesigner/js/external");
            fs.removeSync(destination  + '/external');
        });
        
    }

    if (fs.existsSync(destination + '/modules')) {
        fs.readdir(destination + '/modules', function(err, items) {
            console.log("adding async libs : " + items);
            fs.copySync(destination + '/modules',"webDesigner/libs/modules");
            fs.removeSync(destination + '/modules');
        });
        
    }

    if (fs.existsSync(destination + '/angularHTMLayout')) {
        fs.readdir(destination + '/angularHTMLayout', function(err, items) {
            console.log("adding angularHtmlTemplate libs : " + items);
            fs.copySync(destination + '/angularHTMLayout',"../../data/Common/html");
            fs.removeSync(destination + '/angularHTMLayout');
        });
    }

    if (fs.existsSync(destination + '/themes')) {
        fs.readdir(destination + '/themes', function(err, items) {
            console.log("adding themes : " + items);
            fs.copySync(destination + '/themes',"webDesigner/themes");
            fs.removeSync(destination + '/themes');
        });
    }

}

module.exports = {
    UnzipLayout,
    zipFolder,
};