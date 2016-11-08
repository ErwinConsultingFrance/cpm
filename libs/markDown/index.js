var markdownpdf = require("markdown-pdf")
  , fs = require("fs")
var cwpmFile = require('../file'),
colors = require('colors');


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
    cwpmFile.writeInFile(path + "/README.md", output);
}

function exportReadmeMDtoPDF() {
	markdownpdf().from("README.md").to("Howto.pdf", function () {
		console.log("Done")
	})
}


 module.exports = {
    exportReadmeMDtoPDF,
    UpdateReadmeMD,
}