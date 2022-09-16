// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-signature;

/**
 * Name   : text-file-widget-w-opts.js 
 * Author : @supermamon
 * Docs   : https://github.com/supermamon/scriptable-scripts/docs/text-file-widget.md
 */

const { TextFileWidget } = importModule('lib-text-file-widget')

const widget = new TextFileWidget('notes/notes.txt')
await widget.waitForLoad()

// custom background and padding
widget.setPadding(15, 15, 15, 15)
const nobg = importModule('no-background')
widget.backgroundImage = await nobg.getSlice('medium-top')

// additional content
const dateLine = widget.addDate(new Date())
dateLine.applyDateStyle()
dateLine.font = Font.footnote()
dateLine.rightAlignText()

Script.setWidget(widget)
