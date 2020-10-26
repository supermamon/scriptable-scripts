// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: rss-square;
/* 
Script : spotify-api.js
Author : @supermamon
Version: 1.0.0

More Info: https://github.com/supermamon/oauth-proxy

*/
const FM        = FileManager.iCloud();
const jsonutil  = importModule('./json-util')

function Spotify(storage_dir) {

    this.storage_dir = storage_dir
    this.client_file = FM.joinPath(storage_dir,'client.json')
    
    log(`client_file: ${this.client_file}`)
    
    if (!FM.fileExists(this.client_file)) {
        FM.downloadFileFromiCloud(this.client_file)   
    }

    this.client = jsonutil.loadFromFile(this.client_file)
    log(`client: ${JSON.stringify(this.client)}`)

    this.current_user_file = FM.joinPath(storage_dir,'current_user.access_token.json')
    
    if (!FM.fileExists(this.current_user_file)) {
        FM.downloadFileFromiCloud(this.current_user_file)
    }

    log(`current_user_file: ${this.current_user_file}`)
    
    if (FM.fileExists(this.current_user_file)) {
        this.token = jsonutil.loadFromFile(this.current_user_file)
    } else {
        this.token = {}
    }

    log(`token: ${JSON.stringify(this.token)}`)

    this.BASE_ENDPOINT  = 'https://api.spotify.com/v1'
    this.AUTH_URL       = 'https://accounts.spotify.com/authorize'
    this.TOKEN_URL      = 'https://accounts.spotify.com/api/token'
    this.REFRESH_URL    = this.TOKEN_URL

}

Spotify.prototype.isAuthenticated = function() {
    return (!!this.token.access_token)
}

Spotify.prototype.launchAuthentication = function(scope, state)
{
    let auth_url = this.AUTH_URL
    auth_url += `?client_id=${this.client.client_id}`
    auth_url += `&response_type=code`
    auth_url += `&scope=${encodeURIComponent(scope)}`
    auth_url += `&state=${encodeURIComponent(state)}`
    auth_url += `&redirect_uri=${encodeURIComponent(this.client.redirect_uri)}`
    console.log('auth_url', auth_url)

    Safari.open(auth_url)
}

Spotify.prototype.getAccessToken = async function(authorization) {

    var req = new Request(this.TOKEN_URL)
    req.headers = {
        'Authorization' : `${this.client.authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    req.method = 'POST'
    let body = `grant_type=authorization_code` +
                `&code=${encodeURIComponent(authorization.code)}` +
                `&redirect_uri=${encodeURIComponent(this.client.redirect_uri)}`

    req.body = body

    this.token =  await req.loadJSON();

    let end_date = new Date();
    end_date.setSeconds(end_date.getSeconds() + this.token.expires_in)

    this.token['expires_on'] = end_date

    jsonutil.writeToFile(this.token, FM.joinPath(this.storage_dir, 'current_user.access_token.json'))

    return this.token
}

Spotify.prototype.refreshToken = async function() {

    if (!this.isAuthenticated()) {
        throw 'Not yet authenticated.'
    }

    let now = new Date()
    let expiry = new Date(this.token.expires_on)

    log('checking token validity')
    if (now < expiry) {
        log('token is still valid. not refreshing')
        return this.token
    } else {
        log('token expired. refreshing.')
    }

    var req = new Request(this.REFRESH_URL)
    req.headers = {
        'Authorization' : `${this.client.authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    req.method = 'POST'
    let body = `grant_type=refresh_token` +
                `&refresh_token=${encodeURIComponent(this.token.refresh_token)}`

    req.body = body

    this.token =  await req.loadJSON();

    let end_date = new Date();
    end_date.setSeconds(end_date.getSeconds() + this.token.expires_in)

    this.token['expires_on'] = end_date

    jsonutil.writeToFile(this.token, FM.joinPath(this.storage_dir, 'current_user.access_token.json'))

    return this.token

}
Spotify.prototype.getUser = async function() {
    if (!this.isAuthenticated()) {
        throw 'Not yet authenticated.'
    }

    await this.refreshToken()

    let url = `${this.BASE_ENDPOINT}/me`
    var req = new Request(url)
    req.headers = {
        'Authorization' : `Bearer ${this.token.access_token}`
    }
    req.method = 'GET'
    this.user =  await req.loadJSON();
    return this.user
    
}
Spotify.prototype.getLatestPlayed = async function(limit) {
    limit = limit?limit:20
    var url = `${this.BASE_ENDPOINT}/me/player/recently-played?limit=${limit}`

    let req = new Request(url)
    req.headers = {
        'Authorization' : `Bearer ${this.token.access_token}`
    }
    req.method = 'GET'

    let resp = await req.loadJSON()

    let items = resp.items.map(item => {
        return {
            name: item.track.name,
            played_at: item.played_at
        }
    })
    return items;
    
}


module.exports = Spotify