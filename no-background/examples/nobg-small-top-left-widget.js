// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;

/*
Script      : nobg-small-top-left-widget.js
Author      : me@supermamon.com
Version     : 1.0.0
Description :
  Example script for the no-backkground module.
*/

const nobg = importModule('no-background.js')

var widget = new ListWidget()

widget.backgroundImage = await nobg.getSlice('small-top-left')

var msg = `Hello Scriptable!`
var mode = widget.addText(msg)
mode.textColor = Color.white()
mode.centerAlignText()

if (config.runsInWidget) {
    Script.setWidget(widget)
} else {
    widget.presentSmall()
}
