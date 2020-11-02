// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: cloud;
//

// REQUIRED!!
// you need an Open Weather API key.
// Get one for free at: https://home.openweathermap.org/api_keys

const API_KEY = ""

// Alternatively, store API keys in a module
//
//const keys = importModule('api-keys.js')
//const API_KEY = keys.OpenWeatherMap


const owm = importModule('openweathermap.js')

// to be able to customize units on the 
// widget configuration screen
let units = 'metric'
if (args.widgetParameter) {
  units = args.widgetParameter.toString()
}

// initialization options

// 1. automatic location detection
// requires user to allow location access on the 
// first run
// let wttr = await owm({appid: API_KEY})

// 2. automatic location detection with reverse
// geocoding to identify locaiton name
// let wttr = await owm({appid: API_KEY, 
//    revgeocode:true
// })

// 3. specific location, no geocoding
// provide custom location coordinates and name
// faster than automatic detection

let wttr = await owm({
  appid: API_KEY, 
  units:units,
  lat: 37.32, 
  lon: -122.03,
  revgeocode: true
})

// 4. localization and units
// let wttr = await owm({appid: API_KEY, 
//    lang: 'fr',
//    units: 'imperial
//  })

const shadowOffset = new Point(1,1)
const shadowColor = Color.lightGray()
const shadowRadius = 0

var widget = new ListWidget()
widget.backgroundColor = Color.white()

// change the gradient color depending if it's 
// nigh or day
let gdcolor = wttr.current.is_night ? '0a0a0a' : '277bae'
widget.backgroundGradient = newLinearGradient([`#${gdcolor}ee`,`#${gdcolor}aa`],[0,.8])

// content

// location
var loc_name;
if (wttr.geo) {
  loc_name = wttr.geo.postalAddress.city
} else if (wttr.args.location_name) {
  loc_name = wttr.args.location_name
}
if (loc_name) {
  var location = widget.addText(loc_name)
  location.font = Font.boldSystemFont(14)
  location.leftAlignText()
  widget.addSpacer(1)
}

// temparature
var temp = addText(widget,`${Math.round(wttr.current.temp)}°`)
temp.font = Font.ultraLightSystemFont(46)
temp.leftAlignText()

// icon
var symbol = SFSymbol.named(wttr.current.weather[0].sfsymbol)
var icon = widget.addImage(symbol.image)
icon.leftAlignImage()
icon.size = new Size(8,8)

widget.addSpacer(5)

// conditions
var conditions = addText(widget,`${wttr.current.weather[0].description}`)
conditions.font = Font.systemFont(12)

// feels like
var fl = addText(widget,`feels like ${Math.round(wttr.current.feels_like)}°${wttr.units.temp}`)
fl.font = Font.systemFont(12)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  await widget.presentSmall()
}

Script.complete()

function addText(container, text){
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
                     .map(color=>new Color(color))
  return gradient
}