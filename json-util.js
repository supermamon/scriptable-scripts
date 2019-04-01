// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: star-of-life;

const FM    = FileManager.iCloud();

var jsonUtil = {}

jsonUtil.encodeAsQueryString = function(json) 
{
    var result = ''
    for (var key in json) {
        let val = json[key]
        val = encodeURIComponent(val)
        result += result?'&':''
        result += `${key}=${val}`
    }
    return result
}

jsonUtil.loadFromFile = function(path) {
    let contents = FM.readString(path)
    return JSON.parse(contents)
}

jsonUtil.writeToFile = function(json, path) {
    FM.writeString(path,JSON.stringify(json))
}

module.exports = jsonUtil