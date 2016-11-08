var cwpm = {}
var file = require('./file')
var zip = require('./zip')
var url = require('./url')
var layout = require('./layout')


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

Object.keys(layout).forEach(function (key) {
  cwpm[key] = layout[key]
})

module.exports = cwpm
