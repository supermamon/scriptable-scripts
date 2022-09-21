// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cloud;


/* **********************************************
Name    : simple-weather-widget.js
Author  : @supermamon
Version : 1.0.1
Desc    : Example widget using the openweathermap.js module

// https://github.com/supermamon/scriptable-scripts/blob/master/docs/openweathermap.md

Changelog:
-------------------------------------------------
v1.0.0 | 02 Nov 2020
* Initial release
-------------------------------------------------
v1.0.1 | 02 Nov 2020
* (fix) API_KEY requires an unshared module
-------------------------------------------------
v1.0.2 | 20 Sep 2022
* (fix) location_name does not override when revgeocode=true
* (doc) in-code documentation
********************************************** */


// REQUIRED!!
// you need an Open Weather API key.
// Get one for free at: https://home.openweathermap.org/api_keys

let API_KEY = "your-api-key"

// Alternatively, store API keys in a module
// Example:
// const secrets = importModule('secrets.js')
// API_KEY = secrets.openweathermap

// ALSO REQUIRED, openweathermap module
const owm = importModule('openweathermap.js')

// by not providing lat and lon, script will 
// run automatic location detection 
// reverse geocoding `true` will identify the
//  location name
const options = {
  appid: API_KEY,
  revgeocode: true,
  exclude: 'hourly,daily'
}

// all other options
/*
const options = {
  appid: API_KEY,

  // auto-find the location name 
  revgeocode: true,

  // units standard | metric | imperial
  units: 'imperial',

  // provide coordinates to disable location
  // detection
  lat: 35.6725687,
  lon: 139.7526493,

  // provide location name instead of geo-coding
  location_name: 'Tokyo',

  // alternative language. provide 2-letter code
  lang: 'fr',
}


*/

// load weather data
const wttr = await owm(options)

// create the widget
const widget = new ListWidget()
widget.backgroundColor = Color.white()

// text shadows
const shadowOffset = new Point(1, 1)
const shadowColor = Color.lightGray()
const shadowRadius = 0

// change the gradient color depending if it's 
// night or day
const gdcolor = wttr.current.is_night ? '0a0a0a' : '277bae'
widget.backgroundGradient = newLinearGradient([`#${gdcolor}ee`, `#${gdcolor}aa`], [0, .8])

// content

// location
let loc_name;
if (wttr.args.location_name) {
  // if location is manually provided
  loc_name = wttr.args.location_name
} else if (wttr.geo) {
  // if reverse-geocoded is performed
  loc_name = wttr.geo.locality ?? wttr.geo.name ?? wttr.geo.postalAddress.city
}

// add location name on widget if exists
if (loc_name) {
  const location = widget.addText(loc_name)
  location.font = Font.boldSystemFont(14)
  location.leftAlignText()
  widget.addSpacer(1)
}

// temparature
const temp = addText(widget, `${Math.round(wttr.current.temp)}°`)
temp.font = Font.ultraLightSystemFont(46)
temp.leftAlignText()

// icon
const symbol = SFSymbol.named(wttr.current.weather[0].sfsymbol)
const icon = widget.addImage(symbol.image)
icon.leftAlignImage()
icon.size = new Size(8, 8)

widget.addSpacer(5)

// conditions
const conditions = addText(widget, `${wttr.current.weather[0].description}`)
conditions.font = Font.systemFont(12)

// feels like
const fl = addText(widget, `feels like ${Math.round(wttr.current.feels_like)}°${wttr.units.temp}`)
fl.font = Font.systemFont(12)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  await widget.presentSmall()
}

Script.complete()

function addText(container, text) {
  let oText = container.addText(text)
  oText.shadowColor = Color.lightGray()
  oText.shadowOffset = new Point(1, 1)
  oText.shadowRadius = 1
  return oText
}

//------------------------------------------------
function newLinearGradient(hexcolors, locations) {
  let gradient = new LinearGradient()
  gradient.locations = locations
  gradient.colors = hexcolors
    .map(color => new Color(color))
  return gradient
}