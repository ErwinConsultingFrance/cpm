"use strict";
var fs = require("fs-extra");
var cwpmMarkDown = require("../markDown");
var cwpmRepository = require("../repository");
var cwpmZip = require("../zip");
var cwpmFile = require("../file");
var request = require("request");
var cwpmURL = require("../url");

function BuildPackage(err) {
  if (!err) {
    var layoutPackage, version, name;
    console.log("version has been updated.".green);
    layoutPackage = JSON.parse(fs.readFileSync("package.json", "utf8"));
    cwpmFile.createDirIfNotExists("dist");
    version = layoutPackage["evolve-version"].replace(/ /g, "");
    name = ["./dist/", layoutPackage.name, "-v", layoutPackage.version, "-evolve-v", version, ".zip"].join("");

    if (layoutPackage.wiki === undefined) {
      console.log("Please set the wiki page path inside the pacakge.json".red);
      return false;
    }

    var wikiPath = layoutPackage.wiki + "/Home.md";
    console.log("fetch wiki page", wikiPath);
    cwpmFile.createDirIfNotExists("./help");
    var callback = 2;
    request(wikiPath, function(err, res, body) {
      cwpmFile.writeInFile("./help/Help_layout.md", body);
      cwpmMarkDown.exportReadmeMDtoPDF("./help/Help_layout.md", function() {
        callback = callback - 1;
        if (callback === 0) {
          setTimeout(function() {
            cwpmZip.zipFolder(name, layoutPackage.name, function() {
              console.log("zip is done".green);
            });
          }, 0); // wait the pdf to load?
        }
      });
    });
    request("https://github.com/nevakee716/cpm/wiki/Home.md", function(err, res, body) {
      cwpmFile.writeInFile("./help/Help_cpm.md", body);
      cwpmMarkDown.exportReadmeMDtoPDF("./help/Help_cpm.md", function() {
        callback = callback - 1;
        if (callback === 0) {
          setTimeout(function() {
            cwpmZip.zipFolder(name, layoutPackage.name, function() {
              console.log("zip is done".green);
            });
          }, 0); // wait the pdf to load?
        }
      });
    });
  }
}

function DoPackage(optionsPackage) {
  console.log("do package", optionsPackage);
  cwpmRepository.updateVersion(optionsPackage, BuildPackage);
}

module.exports = {
  DoPackage,
};
