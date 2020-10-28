// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: tablets;

// script     : peanuts-widget.js
// version    : 1.0.0 
// author     : me@supermamon.com
// date       : 2020-10-28
// description: shows a random or today's Peanuts
//   comic. source from 
//   https://www.gocomics.com/peanuts/


const BACKGROUND_DARK_MODE = "system" 
// options: "yes", "no", "system"
const SHOW_TITLE  = true
const SHOW_DATE   = true


let RANDOM        = false
// default is current comic
// set the Parameter value to "random" in the 
// Edit Widget screen to use a random comic
if (args.widgetParameter == 'random') {
  RANDOM = true
}

let data = await loadData(RANDOM)
let widget = await createWidget(data)

if (!config.runsInWidget) {
  await widget.presentMedium()
} else {
  Script.setWidget(widget) 
}
Script.complete()
// -----------------------------------------------
async function createWidget(data) {
  const w = new ListWidget();
  w.setPadding(15,0,15,0)

  let isDarkMode = 
    BACKGROUND_DARK_MODE=="system" ? 
    await isUsingDarkAppearance() : 
    BACKGROUND_DARK_MODE=="yes"

  if (isDarkMode) {
    w.backgroundGradient = newLinearGradient('#010c1ee6','#001e38b3')
  } else {
    w.backgroundGradient = newLinearGradient('#b00a0fe6','#b00a0fb3')
  }
  
  w.addSpacer()

  if (SHOW_TITLE) {
    let titleTxt = w.addText('Peanuts')
    titleTxt.font = Font.boldSystemFont(14)
    titleTxt.centerAlignText()
    titleTxt.textColor = Color.white()
    w.addSpacer(2)
  }

  let img = await downloadImage(data.img);
  let pic = w.addImage(img)
  pic.centerAlignImage()

  if (SHOW_DATE) {
    w.addSpacer(2)
    let dateTxt = w.addText(data.formattedDate)
    dateTxt.centerAlignText()
    dateTxt.textColor = Color.white()
  }

  w.addSpacer()
  return w
}
// -----------------------------------------------
function newLinearGradient(from, to) {
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(from),
    new Color(to)
  ]
  return gradient
}
// -----------------------------------------------
async function downloadImage(imgurl) {
  let imgReq = new Request(imgurl)
  let img = await imgReq.loadImage()
  return img
}
// -----------------------------------------------
async function loadData(random) {
  var comicDate = new Date()
  if (random) {
    var start = new Date(1950, 9, 2)
    var end = new Date()
    comicDate = new Date(+start + Math.random() * (end - start));
  } 
  log(comicDate)
  var df = new DateFormatter()
  df.dateFormat = 'YYYY/MM/dd'
  var dfDate = df.string(comicDate)
  var url = `https://www.gocomics.com/peanuts/${dfDate}`
  var req = new Request(url)
  var src = await req.loadString()
  var m = src.match(/og:image"\scontent="([^"]+)/)
  var imgUrl = m[1]
  return {
    date: comicDate,
    formattedDate: dfDate,
    img: imgUrl
  }
}
// -----------------------------------------------
function randomDate(start, end) {
  var date = new Date(+start + Math.random() * (end - start));
  return date;
}
// -----------------------------------------------
async function isUsingDarkAppearance() {
  const wv = new WebView()
  let js ="(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)"
  let r = await wv.evaluateJavaScript(js)
  return r
}