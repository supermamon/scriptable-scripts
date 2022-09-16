// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-signature;

/* **********************************************
Name    : text-file-widget.js
Author  : @supermamon
Version : 1.0 
Desc    : A widget to display the contents of a 
          text file. Pass the file path (relative 
          to the Scriptable folder) as widget 
          parameter
Dependencies :
* module: lib-text-file-widget.js
* iCloud enabled for Scriptable

Changelog:
-------------------------------------------------
v1.0.0 | 2022-09-16
* Initial release
********************************************** */

const { TextFileWidget } = importModule('lib-text-file-widget')
const widget = new TextFileWidget(args.widgetParameter)
await widget.waitForLoad()
Script.setWidget(widget)

if (config.runsInApp) {
  await widget.presentLarge()
}