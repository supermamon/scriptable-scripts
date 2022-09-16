// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: file-alt;

/* **********************************************
Name    : lib-text-file-widget.js
Author  : @supermamon
Version : 1.0 
Desc    : A widget to display the contents of a 
          text file. 
Dependencies :
  * iCloud enabled for Scriptable

Changelog:
-------------------------------------------------
v1.0.0 | 2022-09-16
* Initial release
********************************************** */


class TextFileWidget extends ListWidget {

  constructor(filename, { minimumScale = 0.65, absolute = false, font = Font.body(), padding = 10, showFilename = false, centerContent = false } = {}) {
    super()

    if (config.runsInAccessoryWidget) {
      // override padding when in home screen
      padding = 0
    }

    this.loading = true
    this.minimumScale = minimumScale
    this.absolute = absolute
    this.filename = filename
    this.padding = padding
    this.setPadding(padding, padding, padding, padding)
    this.font = font
    this.showFilename = showFilename
    this.centerContent = centerContent


    if (!filename) {
      this.addText('filename not provided')
      this.loading = false
      return
    }

    const Files = FileManager.iCloud()
    this.filepath = this.absolute ? filename : Files.joinPath(Files.documentsDirectory(), filename)

    if (this.showFilename) {
      log('displaying filename')
      const fileNameStack = this.addStack()
      fileNameStack.layoutHorizontally()
      fileNameStack.addSpacer()
      const fnText = fileNameStack.addText(Files.fileName(this.filepath))
      fnText.font = Font.regularSystemFont(8)
      fileNameStack.addSpacer()
      this.addSpacer(2)
    }

    if (!Files.fileExists(this.filepath)) {
      log('file does not exists')
      const text = this.addText("File doesn't exists.")
      text.minimumScaleFactor = this.minimumScale
      text.font = this.font
      this.loading = false
    } else {
      Files.downloadFileFromiCloud(this.filepath)
        .then(() => {
          log('loading file contents')

          try {
            const content = Files.readString(this.filepath)
            log(content)
            const text = this.addText(content)
            if (centerContent) {
              text.centerAlignText()
            }

            text.minimumScaleFactor = this.minimumScale
            text.font = this.font
            log('file loaded and displayed')

          } catch (e) {
            log(e.message)
            const text = this.addText(e.message)

            text.minimumScaleFactor = this.minimumScale
            text.font = this.font
            log('encountered error')
          }

          this.loading = false

        })
    }

    // test refresh every minute   
    const nextRefresh = new Date()
    nextRefresh.setTime(nextRefresh.getTime() + 1000 * 60)
    this.refreshAfterDate = nextRefresh

  }

  waitForLoad() {
    return new Promise((resolve, reject) => {
      if (!this.loading) {
        log('not waiting because not loading')
        resolve(0)
        return
      }
      const timeout = 1000 * 3 // seconds
      let iterations = 0

      const t = new Timer()
      t.timeInterval = 200
      t.schedule(() => {
        iterations += 200
        if (!this.loading) {
          log('stop waiting because file is loaded')
          t.invalidate()
          resolve(0)
          return
        } else if (iterations >= timeout) {
          log('stop waiting because timeout reached')
          this.loading = false
          t.invalidate()
          resolve(1)
          return
        }
        log('still loading...')
      })
    })
  }
}



module.exports = { TextFileWidget }