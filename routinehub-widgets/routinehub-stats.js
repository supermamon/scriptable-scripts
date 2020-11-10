// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: user-astronaut;

var RoutineHub = importModule("./routinehub-api")
const QT = importModule('./quick-table.js')

const rh_api_key = '2ee263a2f5dde940c6998acc151eddab073e3143'

var rh = new RoutineHub(rh_api_key)
var data = await rh.getAllShortcutStats()

const t = new QT()   
t.addHeaders({
    text: "Name",
    modify: (cell) => {cell.widthWeight = 6}
  },
  {
    text: "⤵️",
    modify: (cell) => {cell.widthWeight = 2}
  },
  {
    text: "💟",
    modify: (cell) => {cell.widthWeight = 1}
  }
)
data.forEach( shortcut => {
  t.addRow(
    {
      text:shortcut.name,
      modify: (cell) => {cell.widthWeight = 6}
    },{
      text:`${shortcut.downloads}`,
      modify: (cell) => {cell.widthWeight = 2}
    },{
      text:`${shortcut.hearts}`,
      modify: (cell) => {cell.widthWeight = 1}
    }
  )
})
t.table.present()
