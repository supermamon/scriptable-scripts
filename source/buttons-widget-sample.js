// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: grip-horizontal;

/* **********************************************
Name    : buttons-widget-sample.js
Author  : @supermamon
Version : 1.0.0
Desc    : A example widget that uses the 
  button-widget library

See https://github.com/supermamon/scriptable-scripts/tree/master/docs/buttons-widget.md

Changelog:
-------------------------------------------------
v1.0.0 | 2022-09-19
* Initial release
********************************************** */

const { ButtonsWidget } = importModule('buttons-widget')

// fill the widget parameter with 'compact' to get smaller icons
const is_compact = (args.widgetParameter || '').includes('compact')

const buttons = [

  // icon using SF Symbol
  { symbol: 'rectangle.stack.person.crop', action: 'http://www.savethechildren.org/', label: "Save" },
  { symbol: 'shield.lefthalf.fill', action: 'http://www.rescue.org/', label: 'Rescue' },
  { symbol: 'hand.draw', action: 'http://www.pih.org/', label: 'Hand' },

  // empty button
  null,

  // text caption
  { label: "Tap Here", action: "http://www.oxfamamerica.org/" },

  // button custom colors
  { symbol: 'bandage', action: 'https://www.directrelief.org/', iconColor: Color.red(), label: 'Bandage' },
  { symbol: 'waveform.path', action: 'http://www.doctorswithoutborders.org/', iconColor: Color.green(), label: 'Wave' },

  // icon using image
  { icon: (await getIcon()), iconColor: new Color('#094563'), label: 'Automate', action: 'https://talk.automators.fm' },


]

// create the widget
const widget = new ButtonsWidget(buttons, {
  widgetFamily: config.widgetFamily || 'medium',
  compact: is_compact
})

// #OPTIONAL
// add background if needed
const transparent = (args.widgetParameter || '').includes('transparent')
if (transparent) {
  const fm = FileManager.iCloud()
  const nobgscript = fm.joinPath(fm.documentsDirectory(), 'no-background.js')
  if (fm.fileExists(nobgscript)) {
    const nobg = importModule('no-background')
    widget.backgroundImage = await nobg.getSlice('medium-top')
  }
}
// END #OPTIONAL


Script.setWidget(widget)

if (config.runsInApp) {
  await w.presentMedium()
}

async function getIcon() {
  const req = new Request('https://talk.automators.fm/user_avatar/talk.automators.fm/automatorbot/90/16_2.png')
  return (await req.loadImage())
}

