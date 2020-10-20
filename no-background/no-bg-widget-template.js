// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: font;


const nobg = importModule('no-background.js')
const RETURN_TO_HOME = true
const widgetID = 'nobgwidget'
//------------------------------------------------
async function createWidget() { 
  const widget = new ListWidget();
  widget.backgroundImage = await nobg.getSliceForWidget(widgetID)

  // widget content code goes here

  widget.addSpacer()
  let text = widget.addText('Hello Scriptable')
  text.font = new Font('AppleColorEmoji',14)
  text.textColor = Color.white()
  text.centerAlignText()
  widget.addSpacer()


  // end of widget content code
  return widget
} 


//---[ main ]-------------------------------------
if (config.runsInWidget) {
  let widget = await createWidget()
  Script.setWidget(widget)
  Script.complete()
  return
} else {
  // show options
  let response = await presentAlert(
    'Options', 
    [
    'Preview Widget', 
    'Set Background',
    'Cancel'
    ])
  switch(response) {
    case 0:
      let widget = await createWidget()
      await previewWidget(widget)
      break;
    case 1:
      await nobg.chooseBackgroundSlice(widgetID)
      break;
    default:   
  }
  if (RETURN_TO_HOME) SpringBoard()
  return
}

//------------------------------------------------
async function previewWidget(widget) {
  let resp = await presentAlert('Preview Widget',
    ['Small','Medium','Large','Cancel'])
  switch (resp) {
    case 0:
      await widget.presentSmall()
      break;
    case 1:
      await widget.presentMedium()
      break;
    case 2:
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
function SpringBoard() {
  // https://routinehub.co/shortcut/2900/
  Safari.open(`shortcuts://run-shortcut?name=SpringBoard`)
}