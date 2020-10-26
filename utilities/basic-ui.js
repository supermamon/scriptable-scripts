// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: drafting-compass;

function Picker(data, idProperty, captionProperty, header, returnIDOnly) {
    this.data = data
    this.idProperty = idProperty
    this.captionProperty = captionProperty
    this.header = header
    this.dataOffset = header?1:0
    this.hasHeader = !!header
    this.returnIDOnly = returnIDOnly?true:false
}

Picker.prototype.show = async function() {
    let table = new UITable()
    table.showSeparators = true

    if (this.hasHeader) {
        let headerRow = new UITableRow()
        headerRow.isHeader = true;
        headerRow.addCell( UITableCell.text(this.header))
        table.addRow(headerRow)
    }

    let selectedItem;

    this.data.forEach( item => {
        let row = new UITableRow()
        row.cellSpacing = 10
        row.dismissOnSelect = true
        let cell = UITableCell.text(item[this.captionProperty])
        cell.leftAligned()
        row.addCell(cell)
        table.addRow(row)
        row.onSelect = (index) => {
            var item = this.data[index-this.dataOffset]
            selectedItem = this.returnIDOnly ? item[this.idProperty] : item
        }
    })

    await QuickLook.present(table)// table.present()
    return selectedItem
}

function Prompt(caption, defaultValue) {
    var prompt = new Alert()
    prompt.title = caption
    prompt.addAction('OK')
    prompt.addCancelAction('Cancel')
    prompt.addTextField(caption, defaultValue)
    this.prompt = prompt
}
 Prompt.prototype.show = async function() {
    await this.prompt.presentAlert()
    return this.prompt.textFieldValue(0)
}

module.exports = {
    Picker: Picker,
    Prompt: Prompt
}