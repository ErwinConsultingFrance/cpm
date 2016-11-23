var cwpm = {}
var file = require('./file')
var zip = require('./zip')
var url = require('./url')
var markDown = require('./markDown')
var layout = require('./layout')
var repository = require('./repository')
var package = require('./package')
var install = require('./install')

cwpm["file"] = {};
Object.keys(file).forEach(function (key) {
  cwpm.file[key] = file[key]
})

cwpm["zip"] = {};
Object.keys(zip).forEach(function (key) {
  cwpm.zip[key] = zip[key]
})

cwpm["url"] = {};
Object.keys(url).forEach(function (key) {
  cwpm.url[key] = url[key]
})

cwpm["markDown"] = {};
Object.keys(markDown).forEach(function (key) {
  cwpm.markDown[key] = markDown[key]
})

cwpm["repository"] = {};
Object.keys(repository).forEach(function (key) {
  cwpm.repository[key] = repository[key]
})

Object.keys(layout).forEach(function (key) {
  cwpm[key] = layout[key]
})

Object.keys(package).forEach(function (key) {
  cwpm[key] = package[key]
})

Object.keys(install).forEach(function (key) {
  cwpm[key] = install[key]
})

module.exports = cwpm
