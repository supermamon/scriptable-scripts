// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: rss-square;
/* 
Script : spotify-app.js
Author : @supermamon
Version: 1.0.0

More Info: https://github.com/supermamon/oauth-proxy

*/
const FM        = FileManager.iCloud();
const HOME      = FM.documentsDirectory();
const Spotify   = importModule('./spotify-api.js')

// new instance of the Spotify client
const app = new Spotify(FM.joinPath(HOME, 'spotify'))

// refresh token if needed
await app.refreshToken()

// get the latest played songs
let songs = await app.getLatestPlayed(25)

// display the list
let table = new UITable()
await songs.forEach( song => {
    let row = new UITableRow()

    let titleCell = UITableCell.text(song.name);
    row.addCell(titleCell);
    
    let countCell = UITableCell.text(song.played_at)
    row.addCell(countCell);
    
    row.height = 30
    row.cellSpacing = 5
    table.addRow(row)
})

QuickLook.present(table)