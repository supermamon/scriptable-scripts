// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

const nobg = importModule('no-background.js')

const widget = new ListWidget()
widget.backgroundImage = await nobg.getSliceForWidget(Script.name())

widget.addSpacer()
const t = widget.addText('Hello Scriptable!')
t.centerAlignText()
widget.addSpacer()

if (config.runsInWidget) {
    Script.setWidget(widget)
} else {
    await widget.presentSmall()
}

