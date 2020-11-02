// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: font;

const nobg = importModule('no-background.js')
async function createWidget() {
   
  const widget = new ListWidget();

  widget.backgroundImage = await nobg.getSlice('small-top-right')
  
  var tint = '#ffffff' // default tine
  if (args.widgetParameter){
    try {
      var tmpColor = new Color(args.widgetParameter)
      tint = arge.widgetParameter
    } catch(e) {
      // invalid color. don't set
    }
  }
  
  // create a gradient overlay to mimic a 
  // semi-transparent look 
  nobg.applyTint(widget, tint, 0.05)
  
  widget.addSpacer()
  let text = widget.addText('semi-transparent')
  text.textColor = Color.white()
  text.centerAlignText()
  widget.addSpacer()

  return widget
} //createWidget


//---[ main ]-------------------------------------
if (config.runsInWidget) {
  let widget = await createWidget()
  Script.setWidget(widget)
  Script.complete()
} else {
  let widget = await createWidget()
  await widget.presentSmall()
}
