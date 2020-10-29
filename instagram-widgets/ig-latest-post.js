// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: camera-retro;
/* -----------------------------------------------

Script      : ig-latest-post.js
Author      : me@supermamon.com
Version     : 1.0.0
Description :
  Displays the latest instagram post of a selected
  user or users.

  * Works only for non-private users. 
  * Also does not work for some regions like 
    Switzerland for example. Instagram prevents 
    viewing user metadata without being 
    authenticated. So, this script won't work 
    there.

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

// display the username at the bottom of the 
// widget
const SHOW_USERNAME = true

// desired interval in minuted to refresh the
// widget. This will only tell IOS that it's
// ready for a refresh, whether it actually 
// refreshes is up to IOS
const REFRESH_INTERVAL = 5 //mins

// get usernames from the arguments if passed
let usernames = args.widgetParameter || USERS.join(',')
usernames = usernames.split(',')

// choose a random username and fetch for the user
// information
const username = getRandom(usernames)
const post = await getLatestPost(username)

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

  if (SHOW_USERNAME) {
    widget.backgroundGradient = newLinearGradient(
        ['#ffffff00','#ffffff00','#00000088'],
        [0,.75,1])
    widget.addSpacer()
    const eu = widget.addText(`@${data.username}`)
    eu.leftAlignText()
    eu.url = url
    eu.font = new Font('Helvetica',fontSize)
    eu.shadowRadius = 3
    eu.textColor = Color.white()
    eu.shadowColor = Color.black()
  }
  return widget
  
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
async function getLatestPost(username) {
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
  const user = pj.graphql.user
  if (user.is_private) {
    return {
      has_error: true,
      message: `${username} is private.`
    }
  }
  const post = user.edge_owner_to_timeline_media.edges[0].node
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
    caption: caption
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
