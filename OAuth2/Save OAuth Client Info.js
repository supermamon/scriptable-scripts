// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: save;
/* 
Script : Save OAuth Client Info.js
Author : @supermamon
Version: 1.0.0

More Info: https://github.com/supermamon/oauth-proxy

*/
const FM        = FileManager.iCloud();
const HOME      = FM.documentsDirectory();
const jsonutil  = importModule('./json-util.js')
const UI        = importModule('./basic-ui.js')

async function askForText(caption, defaultValue) {
    let prompt = new UI.Prompt(caption, defaultValue)
    return await prompt.show()
}
async function alert(message) {
    let msg = new Alert()
    msg.message = message
    await msg.present()
}
let app_name        = await askForText('Application Name')
let client_id       = await askForText('client_id')
let client_secret   = await askForText('client_secret')
let redirect_uri    = await askForText('redirect_uri')

let storage_dir = FM.joinPath(HOME, app_name)

if (!FM.fileExists(storage_dir)) {
    FM.createDirectory(storage_dir)
}

let auth = `${client_id}:${client_secret}`
auth = Data.fromString(auth).toBase64String()
auth = `Basic ${auth}`

let client = {
    client_id: client_id,
    client_secret: client_secret,
    authorization: auth,
    redirect_uri: redirect_uri
}

jsonutil.writeToFile(client, FM.joinPath(storage_dir,'client.json'))

await alert(`Client Info saved to \n /Scriptable/${app_name}/client.json.`)