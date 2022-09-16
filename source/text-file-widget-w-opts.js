// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: file-signature;

/**
 * Name   : text-file-widget-w-opts.js 
 * Author : @supermamon
 * Docs   : https://github.com/supermamon/scriptable-scripts/docs/text-file-widget.md
 */

const { TextFileWidget } = importModule('lib-text-file-widget')

const options = {

    // padding
    // default: 2, 10 for home screen widgets
    padding: 8,

    // text scaling
    minimumScale: 0.8,

    // define where the filename parameter is an 
    // absolute or relative path
    absolute: false,

    // Font of the content
    font: Font.regularSystemFont(12),

    // display the filename on the widget
    showFilename: true,

    // horizontally center the file contents
    centerContent: true

}

const widget = new TextFileWidget('notes/notes.txt', options)
await widget.waitForLoad()
Script.setWidget(widget)
