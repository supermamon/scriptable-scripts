// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: sun;

/* -----------------------------------------------
Script      : openweathermap.js
Author      : dev@supermamon.com
Version     : 1.1.0
Description :
  A Scriptable module that encapsulate the 
  One Call API from OpenWeatherMap and additional 
  information shared by developers over the 
  Automators.fm community.

Features
* Auto location detection or custom coordinates
* Night time detection
* SFSymbol names for weather conditions
* Units information
* OpenWeatherMap icon urls

References:
https://openweathermap.org/api/one-call-api
https://talk.automators.fm/t/widget-examples/7994/412
https://talk.automators.fm/t/widget-examples/7994/414

Changelog   :
v1.1.0
- (new) Add sfsymbol and icon to daily forecast
- (fix) Does not allow changing units
v1.0.0
- Initial release
----------------------------------------------- */


//------------------------------------------------
async function getOpenWeatherData({
                  appid='',
                  units='metric',
                  lang='en',
                  exclude='minutely,alerts',
                  revgeocode=false,
                  ...more
                }) {


  var opts = {appid, units, lang, exclude, revgeocode, ...more}                  
  
  
  // validate units
  if (!(/metric|imperial|standard/.test(opts.units))) {
    opts.units = 'metric'
  }

  // if coordinates are not provided, attempt to
  // automatically find them
  if (!opts.lat || !opts.lon) {
    log('cordinates not provided. detecting...')
    try {
      var loc = await Location.current()
      log('successfully detected')
    } catch(e) {
      log('unable to detect')
      throw new Error('Unable to find your location.')
    }
    opts.lat = loc.latitude
    opts.lon = loc.longitude
    log(`located lat: ${opts.lat}, lon: ${opts.lon}`)
  }

  // ready to fetch the weather data
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${opts.lat}&lon=${opts.lon}&exclude=${opts.exclude}&units=${opts.units}&lang${opts.lat}&appid=${opts.appid}`
  let req = new Request(url)
  let wttr = await req.loadJSON()
  if (wttr.cod) {
    throw new Error(wttr.message)
  }
  
  // add some information not provided by OWM
  wttr.tempUnit = opts.units == 'metric' ?
                           'C' : 'F'

  const currUnits = {
    standard: {
      temp: "K",
      pressure: "hPa",
      visibility: "m",
      wind_speed: "m/s",
      wind_gust: "m/s",
      rain: "mm",
      snow: "mm"      
    } ,
    metric: {
      temp: "C",
      pressure: "hPa",
      visibility: "m",
      wind_speed: "m/s",
      wind_gust: "m/s",
      rain: "mm",
      snow: "mm"      
    },
    imperial: {
      temp: "F",
      pressure: "hPa",
      visibility: "m",
      wind_speed: "mi/h",
      wind_gust: "mi/h",
      rain: "mm",
      snow: "mm"      
    }
  }

  wttr.units = currUnits[opts.units]

  if (opts.revgeocode) {
    log('reverse geocoding...')
    var geo = await Location.reverseGeocode(opts.lat, opts.lon)
    if (geo.length) {
      wttr.geo = geo[0]
    }
  }

  //----------------------------------------------
  // SFSymbol function
  // Credits to @eqsOne | https://talk.automators.fm/t/widget-examples/7994/414
  // Reference: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
  const symbolForCondition = function(cond,night=false){
    let symbols = {
    // Thunderstorm
      "2": function(){
        return "cloud.bolt.rain.fill"
      },
    // Drizzle
      "3": function(){
        return "cloud.drizzle.fill"
      },
    // Rain
      "5": function(){
        return (cond == 511) ? "cloud.sleet.fill" : "cloud.rain.fill"
      },
    // Snow
      "6": function(){
        return (cond >= 611 && cond <= 613) ? "cloud.snow.fill" : "snow"
      },
    // Atmosphere
      "7": function(){
        if (cond == 781) { return "tornado" }
        if (cond == 701 || cond == 741) { return "cloud.fog.fill" }
        return night ? "cloud.fog.fill" : "sun.haze.fill"
      },
    // Clear and clouds
      "8": function(){
        if (cond == 800) { return night ? "moon.stars.fill" : "sun.max.fill" }
        if (cond == 802 || cond == 803) { return night ? "cloud.moon.fill" : "cloud.sun.fill" }
        return "cloud.fill"
      }
    }
    // Get first condition digit.
    let conditionDigit = Math.floor(cond / 100)
    return symbols[conditionDigit]()
    
  }

  // find the day that matched the epoch `dt`
  var findDay = function(dt) {
    return wttr.daily.filter( daily => {
      var hDate = new Date( 1000 * dt )
      var dDate = new Date( 1000 * daily.dt )
      return (
        hDate.getYear() == dDate.getYear() && 
        hDate.getMonth() == dDate.getMonth() &&  
        hDate.getDate() == dDate.getDate())
    })[0]
  }
  
  // tell whether it's night or day
  var day = findDay(wttr.current.dt)
  
  wttr.current.is_night = (
    wttr.current.dt > day.sunset || 
    wttr.current.dt < day.sunrise)

    wttr.current.weather[0].sfsymbol = 
    symbolForCondition(
      wttr.current.weather[0].id,
      wttr.current.is_night)

    let wicon = wttr.current.weather[0].icon
    wttr.current.weather[0].icon_url = 
      `http://openweathermap.org/img/wn/@2x.png${wicon}`

  wttr.hourly.map( hourly => {

    var day = findDay(hourly.dt)
    hourly.is_night  = (
      hourly.dt > day.sunset || 
      hourly.dt < day.sunrise)

    hourly.weather[0].sfsymbol = 
      symbolForCondition(
        hourly.weather[0].id, 
        hourly.is_night)

      let wicon = hourly.weather[0].icon
      hourly.weather[0].icon_url = 
        `http://openweathermap.org/img/wn/@2x.png${wicon}`
    
    return hourly
  })

  wttr.daily.map( daily => {

    daily.weather[0].sfsymbol = 
      symbolForCondition(
        daily.weather[0].id, 
        false)

      let wicon = daily.weather[0].icon
      daily.weather[0].icon_url = 
        `http://openweathermap.org/img/wn/@2x.png${wicon}`
    
    return daily
  })


  // also return the arguments provided
  wttr.args = opts

  //log(wttr)
  return wttr

}

module.exports = getOpenWeatherData