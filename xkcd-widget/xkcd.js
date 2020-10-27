// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: angle-right;

// script     : xkcdWidget.js
// version    : 1.0.0 
// description: xkcd widget for Scriptable.app
// author     : @supermamon
// date       : 2020-09-17


const BACKGROUND_DARK_MODE = "system" 
// options: "yes", "no", "system"

let RANDOM = false
// default is current comic
// set the Parameter value to "random" in the 
// Edit Widget screen to use a random comic
if (args.widgetParameter == 'random') {
  RANDOM = true
}

// show the alt text at the bottom of the image.
let SHOW_ALT = true

// load data and create widget
let data = await loadData()
let widget = await createWidget(data)

if (!config.runsInWidget) {
     await widget.presentLarge()
}

// Tell the system to show the widget.
Script.setWidget(widget) 
Script.complete()

async function createWidget(data) {
  const w = new ListWidget();

  let isDarkMode = 
    BACKGROUND_DARK_MODE=="system" ? 
    await isUsingDarkAppearance() : 
    BACKGROUND_DARK_MODE=="yes"

  if (isDarkMode) {
    w.backgroundGradient = newLinearGradient('#010c1ee6','#001e38b3')
  } else {
    w.backgroundGradient = newLinearGradient('#b00a0fe6','#b00a0fb3')
  }
  
  let titleTxt = w.addText(data.safe_title)
  titleTxt.font = Font.boldSystemFont(14)
  titleTxt.centerAlignText()
  titleTxt.textColor = Color.white()

  w.addSpacer(2)

  let img = await downloadImage(data.img);
  let pic = w.addImage(img)
  pic.centerAlignImage()

  w.addSpacer()

  if (SHOW_ALT) {
    let subTxt = w.addText(`${data.num}: ${data.alt}`)
    subTxt.font = Font.mediumSystemFont(10)
    subTxt.textColor = Color.white()
    subTxt.textOpacity = 0.9
    subTxt.centerAlignText()
  }

  return w
}
async function loadData() {
  return (await xkcd(RANDOM))
}
function newLinearGradient(from, to) {
  let gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(from),
    new Color(to)
  ]
  return gradient
}
async function downloadImage(imgurl) {
  let imgReq = new Request(imgurl)
  let img = await imgReq.loadImage()
  return img
}
async function xkcd(random) {
  let url = "https://xkcd.com/info.0.json"
  let req = new Request(url)
  let json = await req.loadJSON()

  if (random) {
    let rnd = Math.floor(Math.random() * (json.num - 1 + 1) ) + 1
    url = `https://xkcd.com/${rnd}/info.0.json`
    req = new Request(url)
    json = await req.loadJSON()
  } 

  return json
}

async function isUsingDarkAppearance() {
  // yes there's a Device.isUsingDarkAppearance() method
  // but I find it unreliable
  const wv = new WebView()
  let js ="(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)"
  let r = await wv.evaluateJavaScript(js)
  return r
}