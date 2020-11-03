// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: camera-retro;
/* -----------------------------------------------

Script      : ig-latest-post.js
Author      : me@supermamon.com
Version     : 1.2.0
Description :
  Displays the latest instagram post of a selected
  user or users. Tap the widget to open the 
  Instagram post in the app

Limitations: 
  * Works only for non-private users. 
  * Also does not work for some regions like 
    Switzerland for example. Instagram prevents 
    viewing user metadata without being 
    authenticated. So, this script won't work 
    there.

Changelog:
v1.2.0 - Option to pick up to 12 of the most 
         recent posts
v1.1.0 - Options to show likes and comments count
v1.0.0 - Initial release
----------------------------------------------- */

// The script randomly chooses from this list of
// users. If a list if users is passed as a 
// parameter on the widget configuration screen,
// it uses those instead.


const USERS = [
  'beautifuldestinations',
  'philippines',
  'igersmanila',
  'palmtraveller'
]

// stuff to display at the bottom of the widget
const SHOW_USERNAME = true
const SHOW_LIKES    = true
const SHOW_COMMENTS = true

// pick up to 12 of the most recent posts and
// select randomly between those. 
const MAX_RECENT_POSTS  = 12

// desired interval in minutes to refresh the
// widget. This will only tell IOS that it's
// ready for a refresh, whether it actually 
// refreshes is up to IOS
const REFRESH_INTERVAL = 5 //mins


// DO NOT EDIT BEYOND THIS LINE ------------------

// only show the staus line is any of the
// status items are visible
const SHOW_STATUS_LINE = SHOW_USERNAME || 
                          SHOW_LIKES || 
                          SHOW_COMMENTS

// get usernames from the arguments if passed
let usernames = args.widgetParameter || USERS.join(',')
usernames = usernames.split(',')

// choose a random username and fetch for the user
// information
const username = getRandom(usernames)
const post = await getLatestPost(username, 
                                MAX_RECENT_POSTS)

if (config.runsInWidget) {
  let widget = post.has_error ? 
    await createErrorWidget(post) :
    await createWidget(post)
  Script.setWidget(widget)
} else {

  const options = ['Small', 'Medium', 'Large', 'Cancel']
  let resp = await presentAlert('Preview Widget', options)
  if (resp==options.length-1) return
  let size = options[resp]
  let widget = post.has_error ? 
    await createErrorWidget(post) :
    await createWidget(post, size.toLowerCase())
  
  await widget[`present${size}`]()
}

Script.complete() 
//------------------------------------------------
async function createWidget(data, widgetFamily) {
  
  widgetFamily = widgetFamily || config.widgetFamily
  const padd = widgetFamily=='large' ? 12 : 10
  const fontSize = widgetFamily=='large' ? 14 : 10

  const img = await download('Image', data.display_url)
  const url = `https://www.instagram.com/p/${data.shortcode}`

  const widget = new ListWidget()

  var refreshDate = Date.now() + 1000*60*REFRESH_INTERVAL
  widget.refreshAfterDate = new Date(refreshDate)

  widget.url = url
  widget.setPadding(padd,padd,padd,padd)
  widget.backgroundImage = img

  if (SHOW_STATUS_LINE) {

    // add gradient with a semi-transparent 
    // dark section at the bottom. this helps
    // with the readability of the status line
    widget.backgroundGradient = newLinearGradient(
      ['#ffffff00','#ffffff00','#00000088'],
      [0,.75,1])

    // top spacer to push the bottom stack down
    widget.addSpacer()

    // horizontal stack to hold the status line
    const stats = widget.addStack()
    stats.layoutHorizontally()
    stats.centerAlignContent()
    stats.spacing = 3

    if (SHOW_USERNAME) {
      const eUsr = addText(stats, `@${data.username}`,'left', fontSize)
    }
    // center spacer to push items to the sides
    stats.addSpacer()
    if (SHOW_LIKES) {
      const heart = addSymbol(stats, 'heart.fill', fontSize)
      const likes = abbreviateNumber(data.likes)
      const eLikes = addText(stats, likes, 'right', fontSize)
    }
    if (SHOW_COMMENTS) {
      const msg = addSymbol(stats, 'message.fill', fontSize)
      const comments = abbreviateNumber(data.comments)
      const eComm = addText(stats, comments, 'right', fontSize)
    }

  }

  return widget
  
}
//------------------------------------------------
function addSymbol(container, name, size) {
  const sfIcon = SFSymbol.named(name)
  const fIcon = sfIcon.image
  const icon = container.addImage(fIcon)
  icon.tintColor = Color.white()
  icon.imageSize = new Size(size,size)
  return icon
}
//------------------------------------------------
function addText(container, text, align, size) {
  const txt = container.addText(text)
  txt[`${align}AlignText`]()
  txt.font = Font.systemFont(size)
  txt.shadowRadius = 3
  txt.textColor = Color.white()
  txt.shadowColor = Color.black()   
}

//------------------------------------------------
function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
//------------------------------------------------
function newLinearGradient(hexcolors, locations) {
  let gradient = new LinearGradient()
  gradient.locations = locations
  gradient.colors = hexcolors
                     .map(color=>new Color(color))
  return gradient
}
//------------------------------------------------
async function createErrorWidget(data) {
  const widget = new ListWidget()
  widget.addSpacer()
  const text = widget.addText(data.message) 
  text.textColor = Color.white()
  text.centerAlignText()
  widget.addSpacer()
  return widget
}
//------------------------------------------------
async function download(dType, url) {
  const req = new Request(url)
  return await req[`load${dType}`](url)
}
//------------------------------------------------
async function getLatestPost(username, maxRecent) {
  const url = `https://instagram.com/${username}?__a=1`
  const req = new Request(url)

  try {
    var pj = await req.loadJSON()
  } catch(e) {
    return {
      has_error: true,
      message: e.message
    }
  }
  // if there's no data
  if (!pj.logging_page_id) {
    return {
      has_error: true,
      message: 'User does not exists.'
    }
  }

  const user = pj.graphql.user
  if (user.is_private) {
    return {
      has_error: true,
      message: `${username} is private.`
    }
  }

  maxRecent = maxRecent > 12 ? 12 : maxRecent
  let idx = Math.floor(Math.random() * maxRecent)

  const post = user.edge_owner_to_timeline_media.edges[idx].node
  var caption = ''
  if (post.edge_media_to_caption.edges.length) {
    caption = post.edge_media_to_caption.edges[0].node.text
  }

  return {
    has_error: false,
    username: username,
    shortcode: post.shortcode,
    display_url: post.display_url,
    is_video: post.is_video,
    caption: caption,
    comments: post.edge_media_to_comment.count,
    likes: post.edge_liked_by.count
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
// found on : https://stackoverflow.com/a/32638472
// thanks @D.Deriso
function abbreviateNumber(num, fixed) {
  
  if (num === null) { return null; } // terminate early
  if (num === 0) { return '0'; } // terminate early
  fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  var b = (num).toPrecision(2).split("e"), // get power
      k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
      c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
      d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
      e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
  return e;
}