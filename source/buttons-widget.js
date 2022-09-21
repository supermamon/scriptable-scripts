// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: grip-horizontal;

/* **********************************************
Name    : buttons-widget.js
Author  : @supermamon
Version : 1.0.0
Desc    : A widget library for creating widgets
   as app/action launchers 

Changelog:
-------------------------------------------------
v1.0.0 | 2022-09-19
* Initial release
-------------------------------------------------
v1.0.1 | 2022-09-20
* (fix) icons too large on smaller devices
-------------------------------------------------
v1.0.2 | 2022-09-20
* (update) simplified icon size formula
* (fix) removed unwanted code
-------------------------------------------------h
v1.0.3 | 2022-09-20
* (fix) custom iconWidth not being applied
* (temp-fix) icons too large on iPad.
********************************************** */


// FLAGS
// lock screen widgets don't support tap targets
// leaving this in in case it happens in the
// future
const FEAT_LS_TAP_TARGETS_SUPPORTED = false
// give stack background color for debugging
const DBG_COLOR_STACKS = false

//===============================================
class ButtonsWidget extends ListWidget {
  constructor(buttons = [], {

    // styles
    backgroundImage,
    compact = false,
    widgetFamily = config.widgetFamily,
    padding = 3,

    // grid
    rows,
    cols,

    // icon
    emptyIconColor = Color.darkGray(),

    iconWidth,
    iconCornerRadius = 18,
    iconColor = Color.blue(),
    iconFontSize,
    iconTintColor = Color.white(),

    // labels
    labelFont = Font.caption2(),
    labelColor,

  } = {}) {
    super()

    // initialize
    Object.assign(this, {
      buttons,

      // styles
      compact,
      widgetFamily,
      padding,

      rows,
      cols,

      iconWidth,
      iconCornerRadius,
      iconColor,
      emptyIconColor,
      iconFontSize,
      iconTintColor,

      labelFont,
      labelColor,
    })

    if (backgroundImage) {
      log('background image provided')
      this.backgroundImage = backgroundImage
    }

    // grid size
    if (FEAT_LS_TAP_TARGETS_SUPPORTED && widgetFamily == 'accessoryRectangular') {
      this.cols = 3
      this.rows = 1
      this.iconWidth = 46
      this.buttonColor = Color.black()
      this.padding = 0
      this.addAccessoryWidgetBackground = false
    } else if (FEAT_LS_TAP_TARGETS_SUPPORTED && widgetFamily == 'accessoryCircular') {
      this.cols = 1
      this.rows = 1
      this.iconWidth = 46
      this.buttonColor = Color.black()
      this.padding = 0
      this.addAccessoryWidgetBackground = true
    } else {

      if (!this.rows) {
        this.rows = widgetFamily == 'extraLarge' ? (compact ? 6 : 4) : widgetFamily == 'large' ? (compact ? 6 : 4) : (compact ? 3 : 2)
      }
      if (!this.cols) {
        this.cols = widgetFamily == 'small' ? (compact ? 3 : 2) : widgetFamily == 'extraLarge' ? (compact ? 12 : 8) : (compact ? 6 : 4)
      }

      const screenSize = Device.screenSize()

      const reference = screenSize.width > screenSize.height ? screenSize.height : screenSize.width
      //const reference = screenSize.width

      if (!this.iconWidth) {
        // must find calculation for iPad
        const iw = Device.isPad() ? 56 : Math.floor(reference * 0.15)
        this.iconWidth = compact ? Math.floor(iw * 0.75) : iw
        //log(`iconWidth = ${this.iconWidth}`)
      }

    }

    this.sidePadding = 3 //
    this.iconFontSize = compact ? 10 : 18
    this.iconSize = new Size(this.iconWidth, this.iconWidth)
    this.labelSize = new Size(this.iconWidth, 14)

    this.spacing = 2
    this.setPadding(this.padding, this.sidePadding, this.padding, this.sidePadding)

    if (DBG_COLOR_STACKS) this.backgroundColor = Color.yellow()

    // main stack
    const vstack = this.addStack()
    vstack.layoutVertically()
    if (DBG_COLOR_STACKS) vstack.backgroundColor = Color.brown()

    let idx = 0; // to track current button
    // this nested loop will render the buttons
    // if there are lesser number of buttons
    // than the capacity of the grid, it will
    // create an empty button. That's where the
    // emptyColor property comes in.

    // loop through rows
    for (var r = 0; r < this.rows; r++) {
      const row = vstack.addStack()
      row.layoutHorizontally()

      // loop through columns
      for (var c = 0; c < this.cols; c++) {

        // spacer conditions
        const has_left_spacer = c > 0 || compact
        const has_right_spacer = c < this.cols - 1 || compact

        // container stack. the box that will
        // contain the icon, label and internal
        // spacers for margin
        const container = row.addStack()
        container.setPadding(0, 0, 0, 0)
        if (DBG_COLOR_STACKS) container.backgroundColor = Color.green()

        if (has_left_spacer) {
          container.addSpacer(2)
        }

        // content area
        // this stack will contain the icon and
        // the label
        const content = container.addStack()
        content.layoutVertically()
        content.setPadding(0, 0, 0, 0)
        if (DBG_COLOR_STACKS) content.backgroundColor = Color.gray()

        // the button itself
        const b = content.addStack()
        b.layoutVertically()

        b.size = this.iconSize
        b.cornerRadius = this.iconCornerRadius

        // get the item, if exists
        const item = idx < this.buttons.length ? this.buttons[idx] : null

        // default empty color for button
        b.backgroundColor = this.emptyIconColor

        // vertical alignment
        b.addSpacer()

        // button content
        const tx = b.addStack()
        tx.layoutHorizontally()

        // center the icon/caption horizontally
        // by putting spacer on each end
        tx.addSpacer()
        if (item) {

          // tap target
          // this can be a website or a url-scheme
          if (item.action) {
            b.url = item.action
          }

          // if button has custom color, use it, else use default
          b.backgroundColor = item?.iconColor ?? this.iconColor

          // priority
          // icon (image), symbol, label
          if (item.icon) {
            const img = tx.addImage(item.icon)
          } else if (item.symbol) {
            const img = tx.addImage(imageFromSymbol(item.symbol))
            img.tintColor = this.iconTintColor
          } else if (item.label) {

            let initials = item.label.split(' ')
            if (initials.length > 1) {
              // grab the first 2 initials if multi-word
              initials = initials.slice(0, 2)
                .map(w => w.substring(0, 1))
                .join('')
                .toUpperCase()
            } else {
              // use the whole label. 
              initials = item.label.toUpperCase()
            }

            const cap = tx.addText(initials)
            cap.textColor = this.iconTintColor
            cap.font = Font.regularSystemFont(this.iconFontSize)
          } else {
            // no lable, icon, or symbol provided
            const img = tx.addImage(imageFromSymbol('questionmark.diamond'))
            img.tintColor = this.iconTintColor
          }
        }
        tx.addSpacer()

        // vertical alignment
        b.addSpacer()

        // it not compact, hide the label
        if (!this.compact) {
          // space between icon and label
          content.addSpacer(2)

          const labelStack = content.addStack()
          labelStack.layoutHorizontally()
          labelStack.setPadding(0, 0, 0, 0)

          labelStack.size = this.labelSize

          if (DBG_COLOR_STACKS) labelStack.backgroundColor = Color.red()

          labelStack.addSpacer(2)
          let label;
          if (item?.label) {
            label = labelStack.addText(item.label)
          } else {
            label = labelStack.addText(' ')
          }
          label.font = this.labelFont
          label.centerAlignText()
          if (this.labelColor) {
            label.textColor = this.labelColor
          }
          label.shadowColor = Color.gray()
          label.shadowOffset = new Point(0, 0)
          label.shadowRadius = 5

          labelStack.addSpacer(2)
        }

        if (has_right_spacer) {
          container.addSpacer(2)
        }

        idx++;
        // only add a spacer if not the last column
        if (c < this.cols - 1) row.addSpacer()
      }

      // only add a spacer if not the last row
      if (r < this.rows - 1) vstack.addSpacer()

    }

  }

}

function imageFromSymbol(name) {
  const sym = SFSymbol.named(name)
  sym.applyRegularWeight()
  const img = sym.image
  return sym.image
}

module.exports = { ButtonsWidget }
