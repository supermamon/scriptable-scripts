// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: tablets;
/* **********************************************
Name    : peanuts-widget.js
Author  : @supermamon
Version : 1.0.1
Desc    : shows a random or today's Peanuts
  comic strip from www.gocomics.com/peanuts/

Changelog:
-------------------------------------------------
v1.0.0 | 2020-10-28
* Initial release
-------------------------------------------------
v1.0.1 | 2022-09-20
* (fix) regex matching
* (update) merged no-background option
* (update) implemented Color.dynamic() for gradient
********************************************** */

const BACKGROUND_DARK_MODE = "system"
// options: "yes", "no", "system"
const TRANSPARENT = false

const SHOW_TITLE = true
const SHOW_DATE = true

let RANDOM = false
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
  w.setPadding(15, 0, 15, 0)

  let fromLightColor = 'b00a0fe6'
  let fromDarkColor = '#010c1ee6'
  let toLightColor = 'b00a0fb3'
  let toDarkColor = '#010c1ee6'
  if (BACKGROUND_DARK_MODE == 'no') {
    fromDarkColor = fromLightColor
    toDarkColor = fromDarkColor
  }
  if (BACKGROUND_DARK_MODE == 'yes') {
    fromLightColor = fromDarkColor
    toLightColor = toDarkColor
  }


  if (!TRANSPARENT) {
    let gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
      Color.dynamic(new Color(fromLightColor), new Color(fromDarkColor)),
      Color.dynamic(new Color(toLightColor), new Color(toDarkColor)),
    ]
    w.backgroundGradient = gradient
  } else {
    const fm = FileManager.iCloud()
    const nobgscript = fm.joinPath(fm.documentsDirectory(), 'no-background.js')
    if (fm.fileExists(nobgscript)) {
      const nobg = importModule('no-background')
      w.backgroundImage = await nobg.getSliceForWidget('peanuts-widget')
    }
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
  log(src)
  var m = src.match(/<picture class="gc-card__image.+?src="([^"]+)/)

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
