// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: receipt;

const SHOW_LASTUPDATE_TIMER = false
const url = 'https://election.krit.me/results.json'
const req = new Request(url)
const data = await req.loadJSON()
const widget = new ListWidget()
widget.setPadding(14, 5, 14, 5)

var refreshDate = Date.now() + 1000*60*5 // 5 minutes
widget.refreshAfterDate = new Date(refreshDate)


// transparent
//const nobg = importModule('no-background')
//const RESET_BACKGROUND = !config.runsInWidget
//widget.backgroundImage = await nobg.getSliceForWidget(Script.name())

const flag = widget.addText('🇺🇸 Elections')
flag.font = Font.systemFont(16)

widget.addSpacer(10)

is_bidden = data[0].candidate = 'Joe Biden'
const colors = [
    is_bidden?Color.blue():Color.red(),
    is_bidden?Color.red():Color.blue(),
    Color.gray()
]

data.forEach( (rec,i) => {

    // name and electoral stack
    const h1 = widget.addStack()
    h1.setPadding(5, 5, 5, 5)
    h1.cornerRadius = 5
    h1.layoutHorizontally()
    h1.backgroundColor = colors[i]

    // name
    const n1 = h1.addText(name(rec.candidate, config.widgetFamily))
    h1.addSpacer()
    // electoral votes
    h1.addText(rec.electoral)

    // subs
    widget.addSpacer(2)
    const sh1 = widget.addStack()
    sh1.layoutHorizontally()
    sh1.centerAlignContent()
    // percentage
    const p1 = sh1.addText(rec.percentage)
    p1.font = Font.systemFont(8)
    
    sh1.addSpacer()
    // count
    const c1 = sh1.addText(`${rec.count}`)
    c1.font = Font.systemFont(8)
    c1.rightAlignText()
    
    widget.addSpacer(8)
    
})

if (SHOW_LASTUPDATE_TIMER) {
    const lastUp = widget.addDate(new Date())
    lastUp.font = Font.systemFont(9)
    lastUp.rightAlignText()
    lastUp.applyRelativeStyle()
}

widget.addSpacer()

Script.setWidget(widget)
widget.presentSmall()

function name(n, f='small') {
  return f=='small' ? n.split(' ')[1] : n
}
