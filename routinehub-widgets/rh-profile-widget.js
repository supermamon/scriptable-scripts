// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: user-astronaut;

/* -----------------------------------------------
Script      : rh-profile-widget.js
Author      : dev@supermamon.com
Version     : 1.0.0
Description :
  A widget to show the current shortcuts and 
  download counts of a routinehub.co profile

Features:
* Displays profile picture
* Adaptive layout to widget size
* Accept username as parameter
* Show downloads delta from the last 24 hrs.
* Dynamic background color base on system
  dark/light appearance
* Support for transparent background using the
  no-background module
----------------------------------------------- */

var PREFER_TRANSPARENT_BG = true
var DARK_MODE_BGCOLOR     = '#262335'
var LIGHT_MODE_BGCOLOR    = '#4f6a8f'

// be careful if want to edit anything after this
// point

// accept username as parameter
var username = args.widgetParameter || 'supermamon'

// if PREFER_TRANSPARENT_BG is true, load the
// no-background module if it exists. if it does
// not exist, script will use the specified colors
var nobg = !PREFER_TRANSPARENT_BG ? null 
    : await importModuleOptional('no-background')
username = username.replace(/^\s+|\s+$|@/,'')
const widgetID = `rh-profile-${username}`
//------------------------------------------------
async function createWidget(widgetFamily='small') 
{  
  // get user information
  const rhu = new RoutineHubUser(username)
  await rhu.load()

  // setup widget
  const widget = new ListWidget()
  widget.setPadding(0,0,0,0)

  widget.backgroundColor = Color.dynamic(
    new Color(LIGHT_MODE_BGCOLOR), 
    new Color(DARK_MODE_BGCOLOR))

  // if the no-background module is loaded, 
  // get the appropriate background
  if (nobg) {
    widget.backgroundImage = 
      await nobg.getSliceForWidget(widgetID)
  }
  
  // size identifiction to help with layout
  const scale = Device.screenScale()
  const dh = Device.screenResolution().height

  const sizeRef = phoneSizes[dh][widgetFamily]
  const size = {...sizeRef}

  size.w = Math.floor(size.w / scale)
  size.h = Math.floor(size.h / scale)

  const smallRef = phoneSizes[dh]['small']
  const small = {...smallRef}
  small.w = Math.floor(small.w / scale)
  small.h = Math.floor(small.h / scale)

  const continerHeight = widgetFamily=='small' 
                          ? Math.floor(small.h/2) 
                          : small.h
  const foreColor = Color.white()

  // setup main container
  const mainStack = widget.addStack()
  mainStack.setPadding(0,0,0,0)
  mainStack[`layout${widgetFamily=='small' ? 'Vertically' : 'Horizontally'}`]()
  mainStack.size = new Size(size.w, size.h)
  mainStack.centerAlignContent()

  // profile photo and name section
  const idStack = mainStack.addStack()
  idStack.size = new Size(small.w,continerHeight)
  idStack.layoutVertically()
  idStack.topAlignContent()
  
  idStack.addSpacer(10) // top padding

  // profile photo image
  const pfpStack = idStack.addStack()
  pfpStack.layoutHorizontally()
  // space | photo | space
  pfpStack.addSpacer()

  var profileImg = rhu.has_profile_photo
      ? await downloadImage(rhu.profile_photo_url)
      : sfIcon('person.crop.rectangle.fill', Font.systemFont(96))
  
  const pfp = pfpStack.addImage(profileImg)
  if (!rhu.has_profile_photo) {
    pfp.tintColor = Color.white()
  }
  pfp.cornerRadius = widgetFamily=='small'?18:55
  pfp.url = rhu.profile_page
  pfpStack.addSpacer()
  
  idStack.addSpacer(8) // space between image and name

  // username
  // space | username | space
  const nameStack = idStack.addStack()
  nameStack.layoutHorizontally()
  nameStack.addSpacer()
  const eUser = nameStack.addText(rhu.username)
  eUser.textColor = foreColor
  eUser.centerAlignText()
  nameStack.addSpacer()

  if(widgetFamily!='small') {
    idStack.addSpacer(10) // bottom padding
  }

  // statistics section
  const statsFont = new Font('Menlo-Regular',14)

  // stats container
  const statsStack = mainStack.addStack()
  statsStack.size = new Size(small.w,continerHeight)
  statsStack.layoutVertically()
  statsStack.topAlignContent()
    
  // shortcuts line
  const shortcutsStack = statsStack.addStack()
  shortcutsStack.layoutHorizontally()
  // space | icon | value | space
  shortcutsStack.addSpacer()
  //icon
  const scIcon = shortcutsStack.addImage(sfIcon('f.cursive.circle.fill', statsFont))
  scIcon.tintColor = foreColor
  scIcon.resizable = false
  //value
  const scCount = shortcutsStack.addText(`        ${formatNumber(rhu.shortcuts)}`.substr(-8))
  scCount.font = statsFont
  scCount.textColor = foreColor
  shortcutsStack.addSpacer()

  statsStack.addSpacer(5)

  // downloads line
  const dlStack = statsStack.addStack()
  dlStack.layoutHorizontally()
  // space | icon | value | space
  dlStack.addSpacer()
  //icon
  const dlIcon = dlStack.addImage(sfIcon('icloud.and.arrow.down.fill', statsFont))
  dlIcon.tintColor = foreColor
  dlIcon.resizable = false
  //value
  const dlCount = dlStack.addText(`         ${formatNumber(rhu.downloads)}`.substr(-8))
  dlCount.font = statsFont
  dlCount.textColor = foreColor
  dlStack.addSpacer()

  // delta line
  if (rhu.newDownloads > 0) {

    statsStack.addSpacer(3)

    const dlDeltaStack = statsStack.addStack()
    dlDeltaStack.layoutHorizontally()
    // space || icon | count | space
    dlDeltaStack.addSpacer()

    //icon
    const deltaIcon = dlDeltaStack.addImage(sfIcon('chevron.right.circle', statsFont))
    deltaIcon.tintColor = foreColor
    deltaIcon.resizable = false
    // count
    const dlDelta = dlDeltaStack.addText(`        +${formatNumber(rhu.newDownloads)}`.substr(-8))
    dlDelta.textColor = Color.green()
    dlDelta.font = statsFont

    dlDeltaStack.addSpacer()
  }
  
  return widget
}

//------------------------------------------------
class RoutineHubUser {

  constructor(username) {
    this.cacheDir = 'cache/rh'
    this.cacheFile = `${username}.json`
    this.username = username
    this.exists = false
    this.downloads = 0
    this.shortcuts = 0
    this.has_profile_photo = false
    this.profile_photo_url = null
    this.profile_page = `https://routinehub.co/user/${username}`
  }

  async load() {

    let req = new Request(this.profile_page)
    let page = await req.loadString()  
  
    let downloads = page.match(/Downloads:\s(\d+)/)[1]
  
    if (!downloads) {
      this.exists = false
      return this
    }
  
    this.exists = true
    this.downloads = parseInt(downloads)
    this.shortcuts = parseInt(page.match(/Shortcuts:\s(\d+)/)[1])

    this.previousStats = await this.getPreviousStats()
    log('previous')
    log(this.previousStats)

    const now = new Date()
    const yesterday = new Date(now - (24 * 60 * 60 * 1000))
    const lastUpdate = this.previousStats.lastUpdate

    if (lastUpdate.getTime() < yesterday.getTime()) {
      log('been more that 24 hours. updating stats')
      this.previousStats = await this.saveNewStats()
    }

    this.newDownloads = this.downloads - this.previousStats.downloads
    //log(this.newDownloads)
    
    let pfpm = page.match(/class="is-rounded"\ssrc="([^"]+)/)
    if (pfpm) {
      this.profile_photo_url = pfpm[1]
      this.has_profile_photo = true
    } 
  
    return this
  
  }  

  async saveNewStats(input) {
    const ICLOUD =  module.filename
                    .includes('Documents/iCloud~')
    const fm = FileManager[ICLOUD 
                ? 'iCloud' 
                : 'local']()
    const cachePath = fm.joinPath(
                        fm.documentsDirectory(), 
                        this.cacheDir)
    fm.createDirectory(cachePath, true)
    const cacheFilePath = fm.joinPath(
                          cachePath,
                          this.cacheFile)
    const newStats = input || {
      lastUpdate: new Date(),
      downloads: this.downloads,
      shortcuts: this.shortcuts
    }
    log('saving updated stats')
    log(newStats)
    if (fm.fileExists(this.cacheFile)) {
      if (ICLOUD) await fm.downloadFileFromiCloud(cacheFilePath)
    }
    fm.writeString(cacheFilePath, JSON.stringify(newStats))
    return newStats

  }
  async getPreviousStats() {
    log('getting previous')
    const ICLOUD =  module.filename
                    .includes('Documents/iCloud~')
    const fm = FileManager[ICLOUD 
                ? 'iCloud' 
                : 'local']()
    const cachePath = fm.joinPath(
                        fm.documentsDirectory(), 
                        this.cacheDir)
    fm.createDirectory(cachePath, true)
    const cacheFilePath = fm.joinPath(
                          cachePath,
                          this.cacheFile)
    log(cacheFilePath)
    if (!fm.fileExists(cacheFilePath)) {
      log('local stats missing. saving')
      //let yest = (new Date).getTime - (24 * 60 * 60 * 1000)
      let stats = {
        lastUpdate: new Date(),
        downloads: this.downloads,
        shortcuts: this.shortcuts
      }
      await this.saveNewStats(stats)
    }
    let stats = JSON.parse(
      fm.readString(cacheFilePath))
    stats.lastUpdate = new Date(stats.lastUpdate)

    return stats
  }
}

//------------------------------------------------
function sfIcon(name, font) {
  const sf = SFSymbol.named(name)
  sf.applyFont(font)
  return sf.image
}
//------------------------------------------------
function formatNumber(n) {
  return new Intl.NumberFormat().format(n)
}


//------------------------------------------------
async function previewWidget() {
  let widget;
  let resp = await presentAlert('Preview Widget',
    ['Small','Medium','Large','Cancel'])
  switch (resp) {
    case 0:
      widget = await createWidget('small')
      await widget.presentSmall()
      break;
    case 1:
      widget = await createWidget('medium')
      await widget.presentMedium()
      break;
    case 2:
      widget = await createWidget('large')
      await widget.presentLarge()
      break;
    default:
  }
}
//------------------------------------------------
async function presentAlert(prompt,items,asSheet) 
{
  let alert = new Alert()
  alert.message = prompt
  
  for (const item of items) {
    alert.addAction(item)
  }
  let resp = asSheet ? 
    await alert.presentSheet() : 
    await alert.presentAlert()
  return resp
}
//------------------------------------------------
async function downloadImage(url) {
  const req = new Request(url) 
  const img = await req.loadImage()
  return img
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
async function importModuleOptional(module_name) {
  const ICLOUD =  module.filename
                    .includes('Documents/iCloud~')
  const fm = FileManager[ICLOUD 
                          ? 'iCloud' 
                          : 'local']()
  if (!/\.js$/.test(module_name)) {
    module_name = module_name + '.js'
  }
  const module_path = fm.joinPath
                        (fm.documentsDirectory(), 
                        module_name)
  if (!fm.fileExists(module_path)) {
    log(`module ${module_name} does not exist`)
    return null
  }
  if (ICLOUD) {
    await fm.downloadFileFromiCloud(module_path)
  }
  const mod = importModule(module_name)
  return mod
}
//---[ main ]-------------------------------------
if (config.runsInWidget) {
  let widget = await createWidget(config.widgetFamily)
  Script.setWidget(widget)
  Script.complete()
} else {
  // show options
  const options = ['Preview Widget']
  if (nobg) {
    options.push('Set Background')
  }
  options.push('Cancel')
  let response = await presentAlert(
    'Options', options)
  let sel = options[response]
  switch(sel) {
    case 'Preview Widget':
      await previewWidget()
      break;
    case 'Set Background':
      await nobg.chooseBackgroundSlice(widgetID)
      break;
    default:   
  }
}
