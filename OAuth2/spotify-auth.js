// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: rss-square;
/* 
Script : spotify-auth.js
Author : @supermamon
Version: 1.0.0

More Info: https://github.com/supermamon/oauth-proxy

Assumptions:
* a `spotify` directory under the Scriptable 
  that contains `client.json`. Use the
  `Save OAuth Client Info` script to generate
  `client.json

*/

const FM        = FileManager.iCloud();
const HOME      = FM.documentsDirectory();
const Spotify   = importModule('./spotify-api.js')

// new instance of the Spotify client
const app = new Spotify(FM.joinPath(HOME, 'spotify'))

async function alert(message) {
    let msg = new Alert()
    msg.message = message
    await msg.present()
}

// if not `code` argument is passed, start the
// authentiation
if (!args.queryParameters['code']) {
    let scope = 'user-read-recently-played'
    let state = 'sriptable-for-iphone'
    app.launchAuthentication(scope, state)
} else {
    // else get the access token
    let token = await app.getAccessToken({
        code: args.queryParameters['code'],
        state: args.queryParameters['state']
    })

    await app.getUser()

    await alert(`${app.user.display_name} authenticated. Access expires on ${app.token.expires_on.toString()}.`) 

}

