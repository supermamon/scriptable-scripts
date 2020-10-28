// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: font;

/*
Script      : nobg-configurable-widget-template.js
Author      : me@supermamon.com
Version     : 1.0.0
Description :
  Example script for the no-backkground module.
  This allows the end user to set the background 
  of the widget at run-time instead of changing
  the code.
*/

const nobg = importModule('no-background.js')
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
