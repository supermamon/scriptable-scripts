// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: chess-board;

/* -----------------------------------------------

Script      : no-background.js
Author      : me@supermamon.com
Version     : 1.4.0
Description :
  A module to create illusions of transparent
  backgrounds for Scriptable widgets

Adapted from Max Zeryck's (@mzeryck) amazing 
invisible widget shared on the Automtors discourse
https://talk.automators.fm/t/widget-examples/7994/135

Changelog   :
v1.4.0 
- (update) also prompt for setup on the getPathForSlice method
v1.3.0 
- (update) automativally prompt for setup when
  slices are missing or if the widget's
  position is not yet stored.

v1.2.0
- (new) applyTint method to simulate a 
  semi-tranparent look
v1.1.1
- (fix) syntax error on generateSlices
- (fix) incorrect iPhone 12 size
v1.1.0
- Support for iPhone 12 & 12 Pro
v1.0.2
- Typos on the documentation
v1.0.1
- Fix iamge does not exists issue
----------------------------------------------- */

//set true to use local file system
const LOCAL_CACHE = false 
const ALERTS_AS_SHEETS = false

let fm = LOCAL_CACHE ? FileManager.local() : FileManager.iCloud()
const CACHE_FOLDER = 'cache/nobg'

let cachePath = fm.joinPath(fm.documentsDirectory(), CACHE_FOLDER);

var exports = {}

//------------------------------------------------
exports.cachePath = cachePath
//------------------------------------------------
exports.generateSlices = async function({caller='none'}) {
  const opts = {caller}

  let appearance = (await isUsingDarkAppearance()) ? 'dark' : 'light'
  let altAppearance = appearance == 'dark' ? 'light' : 'dark'

  if(!fm.fileExists(cachePath)){
    fm.createDirectory(cachePath,true)
  } 

  let message;

  message = "To change background make sure you have a screenshot of you home screen. Go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot."
  let options = ["Pick Screenshot","Exit to Take Screenshot"]
  let resp = await presentAlert(message,options,ALERTS_AS_SHEETS)
  if (resp==1) return false

  // Get screenshot and determine phone size.
  let wallpaper = await Photos.fromLibrary()
  let height = wallpaper.size.height

  let phone = phoneSizes[height]
  if (!phone) {
    message = "It looks like you selected an image that isn't an iPhone screenshot, or your iPhone is not supported. Try again with a different image."
    await presentAlert(message,["OK"],ALERTS_AS_SHEETS)
    return false
  }

  const families = ['small', 'medium', 'large']

  // generate crop rects for all sizes
  for (var i=0; i< families.length; i++) {
    const widgetSize = families[i]

    let crops = widgetPositions[widgetSize].map( posName => {

      let position = posName.toLowerCase().replace(' ','-')

      let crop = { pos:position, w: "", h: "", x: "", y: "" }
      crop.w = phone[widgetSize].w
      crop.h = phone[widgetSize].h
      crop.x = phone.left

      let pos = position.split('-')
      
      crop.y = phone[pos[0]]

      if (widgetSize == 'large' && pos[0]=='bottom' ) {
        crop.y = phone['middle']
      }

      if (pos.length > 1) {
        crop.x = phone[pos[1]]
      }
      
      return crop
    })

    for (var c=0; c<crops.length; c++) {
      const crop = crops[c]
      const imgCrop = cropImage(wallpaper, new Rect(crop.x,crop.y,crop.w,crop.h))

      const imgName = `${appearance}-${widgetSize}-${crop.pos}.jpg`
      const imgPath = fm.joinPath(cachePath, imgName)

      if (fm.fileExists(imgPath)) {
        // sometimes it wouldn't overwrite. 
        // so better delete the file first
        if (!LOCAL_CACHE) await fm.downloadFileFromiCloud(imgPath)
        try {fm.remove(imgPath)} catch (e) {}
      }
      fm.writeImage(imgPath,imgCrop)

    }

  }

  if (opts.caller!='self') {
    message = `Slices saved for ${appearance} mode. You can switch to ${altAppearance} mode and run this again to also generate slices.`
  } else {
    message = 'Slices saved.'
  }
  await presentAlert(message,["Ok"],ALERTS_AS_SHEETS)


  return true 
 
}
exports.applyTint = function(widget, tint, alpha) {
  tint = tint || '#ffffff'
  alpha = alpha || 0.2

  const col = new Color(tint, alpha)
  let gradient = new LinearGradient()
  gradient.locations = [0,1]
  gradient.colors = [col, col]

  widget.backgroundGradient = gradient
}
//------------------------------------------------
exports.getSlice = async function(name) {
  let appearance = (await isUsingDarkAppearance()) ? 'dark' : 'light'

  let position = name
  const imgPath = fm.joinPath(cachePath, `${appearance}-${position}.jpg`)
  if (!fm.fileExists(imgPath)) {
    log('image does not exists. setup required.')
    var setupCompleted = await exports.generateSlices({caller:'getSliceForWidget'})
    if (!setupCompleted) {
      return null
    }
  }

  if (!LOCAL_CACHE) await fm.downloadFileFromiCloud(imgPath)

  let image =  fm.readImage(imgPath)
  return image
}
//------------------------------------------------
exports.getPathForSlice = async function(slice_name) {
  let appearance = (await isUsingDarkAppearance()) ? 'dark' : 'light'
  let imgPath = fm.joinPath(cachePath, 
    `${appearance}-${slice_name}.jpg`)
    
  let fileExists = fm.fileExists(imgPath)
  if (!fileExists) {
    fileExists = await exports.generateSlices('self')
  } else {
    imgPath = null
  }
  
  if (!LOCAL_CACHE && fileExists) await fm.downloadFileFromiCloud(imgPath)
  return imgPath
}
//------------------------------------------------
exports.getSliceForWidget = async function(instance_name, reset=false) {
  const appearance = (await isUsingDarkAppearance()) ? 'dark' : 'light'  
  var cfg = await loadConfig()
  var position = reset ? null : cfg[instance_name]
  if (!position) {
    log(`Background for "${instance_name}" is not yet set.`)

    // check if slices exists
    const testImage = fm.joinPath(cachePath, `${appearance}-medium-top.jpg`)
    let readyToChoose = false
    if (!fm.fileExists(testImage)) {
      // need to generate slices
      readyToChoose = await exports.generateSlices({caller:'self'})
    } else {
      readyToChoose = true
    }

    // now set the 
    if (readyToChoose) {
      var backgrounChosen = await exports.chooseBackgroundSlice(instance_name)
    }

    if (backgrounChosen) {
      cfg = await loadConfig()
      position = cfg[instance_name]
    } else {
      return null
    }
    
  }
  const imgPath = fm.joinPath(cachePath, `${appearance}-${position}.jpg`)
  if (!fm.fileExists(imgPath)) {
    log(`Slice does not exists - ${appearance}-${position}.jpg`)
    return null
  }

  if (!LOCAL_CACHE) await fm.downloadFileFromiCloud(imgPath)

  let image =  fm.readImage(imgPath)
  return image
}
//------------------------------------------------
exports.chooseBackgroundSlice = async function(name) {

  // Prompt for widget size and position.
  let message = "What is the size of the widget?"
  let sizes = ["Small","Medium","Large", "Cancel"]
  let size = await presentAlert(message,sizes,ALERTS_AS_SHEETS)
  if (size==3) return false
  let widgetSize = sizes[size].toLowerCase()
  
  message = "Where will it be placed on?"
  let positions = widgetPositions[widgetSize]
  positions.push('Cancel')
  let resp = await presentAlert(message,positions,ALERTS_AS_SHEETS)
  
  if (resp == positions.length-1) return false
  let position = positions[resp].toLowerCase().replace(' ','-')

  let cfg = await loadConfig()
  cfg[name] = `${widgetSize}-${position}`

  await saveConfig(cfg)
  await presentAlert("Background saved.",["Ok"],ALERTS_AS_SHEETS)
  return true

}
//------------------------------------------------
exports.resetConfig = async function() {
  await saveConfig({})
  log('config file cleared')
}

//-- [helpers] -----------------------------------
//------------------------------------------------
async function loadConfig() {
  const configPath = fm.joinPath(cachePath, "widget-positions.json")
  log(` config exists == ${fm.fileExists(configPath)}`)
  if(!fm.fileExists(configPath)){
    await fm.writeString(configPath,"{}")
    return {}
  } else {
    if (!LOCAL_CACHE) await fm.downloadFileFromiCloud(configPath)
    const strConf = fm.readString(configPath)
    const cfg = JSON.parse(strConf)  
    return cfg
  }
}
//------------------------------------------------
async function saveConfig(cfg) {
  const configPath = fm.joinPath(cachePath, "widget-positions.json")
  if (!LOCAL_CACHE) await fm.downloadFileFromiCloud(configPath)
  await fm.writeString(configPath, JSON.stringify(cfg))
  return cfg
}
//------------------------------------------------
async function presentAlert(prompt, items, asSheet) {
  let alert = new Alert()
  alert.message = prompt
  
  for (const item of items) {
    alert.addAction(item)
  }
  let resp = asSheet ? await alert.presentSheet() : await alert.presentAlert()
  return resp
}
//------------------------------------------------
const widgetPositions = {
  "small"   : [
    "Top Left", "Top Right",
    "Middle Left", "Middle Right",
    "Bottom Left", "Bottom Right"
  ],
  "medium"  : ["Top", "Middle", "Bottom"],
  "large"   : ["Top", "Bottom"]
}
//------------------------------------------------
const phoneSizes =  {
  "2532": {
    "models"  : ["12", "12 Pro"],
    "small"   : {"w": 474, "h": 474 },
    "medium"  : {"w": 1014, "h": 474 },
    "large"   : {"w": 1014, "h": 1062 },
    "left"    : 78,
    "right"   : 618,
    "top"     : 231,
    "middle"  : 819,
    "bottom"  : 1407
  },
   
  "2688": {
    "models"  : ["Xs Max", "11 Pro Max"],
    "small"   : {"w": 507,  "h": 507},
    "medium"  : {"w": 1080, "h": 507},
    "large"   : {"w": 1080, "h": 1137},
    "left"    : 81,
    "right"   : 654,
    "top"     : 228,
    "middle"  : 858,
    "bottom"  : 1488
  },
  
  "1792": {
    "models"  : ["11", "Xr"],
    "small"   : {"w": 338, "h": 338},
    "medium"  : {"w": 720, "h": 338},
    "large"   : {"w": 720, "h": 758},
    "left"    : 54,
    "right"   : 436,
    "top"     : 160,
    "middle"  : 580,
    "bottom"  : 1000
  },
  
  "2436": {
    "models"  : ["X", "Xs", "11 Pro"],
    "small"   : {"w": 465, "h": 465},
    "medium"  : {"w": 987, "h": 465},
    "large"   : {"w": 987, "h": 1035},
    "left"    : 69,
    "right"   : 591,
    "top"     : 213,
    "middle"  : 783,
    "bottom"  : 1353
  },
  
  "2208": {
    "models"  : ["6+", "6s+", "7+", "8+"],
    "small"   : {"w": 471, "h": 471},
    "medium"  : {"w": 1044, "h": 471},
    "large"   : {"w": 1044, "h": 1071},
    "left"    : 99,
    "right"   : 672,
    "top"     : 114,
    "middle"  : 696,
    "bottom"  : 1278
  },
  
  "1334": {
    "models"  : ["6","6s","7","8"],
    "small"   : {"w": 296, "h": 296},
    "medium"  : {"w": 642, "h": 296},
    "large"   : {"w": 642, "h": 648},
    "left"    : 54,
    "right"   : 400,
    "top"     : 60,
    "middle"  : 412,
    "bottom"  : 764
  },

  "1136": {
    "models"  : ["5","5s","5c","SE"],
    "small"   : {"w": 282, "h": 282},
    "medium"  : {"w": 584, "h": 282},
    "large"   : {"w": 584, "h": 622},
    "left"    : 30,
    "right"   : 332,
    "top"     : 59,
    "middle"  : 399,
    "bottom"  : 399
  }
}
//------------------------------------------------
function cropImage(img,rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.width, rect.height)
  draw.drawImageAtPoint(img,new Point(-rect.x, -rect.y))  
  return draw.getImage()
}
//------------------------------------------------
async function isUsingDarkAppearance() {
  const wv = new WebView()
  let js ="(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)"
  let r = await wv.evaluateJavaScript(js)
  return r
}

module.exports = exports

