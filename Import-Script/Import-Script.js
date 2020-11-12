// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: download; share-sheet-inputs: plain-text, url;

/* -----------------------------------------------
Script      : Import-Script.js
Author      : me@supermamon.com
Version     : 1.5.2
Description :
  A script to download and import files into the
  Scriptable folder. Includes a mini repo file 
  browser for github repos.

Supported Sites
* github.com
* gist.github.com
* pastebin.com
* hastebin.com
* raw code from the clipboard

Changelog:
v1.5.2 - (fix) detection errors on last version
v1.5.1 - (fix) unrecognized github file urls
v1.5.0 - (new) ability to accept urls via the 
         queryString argument. This is to allow
         creating scriptable:/// links on webpages
         to download scripts
v1.4.0 - (new) option to use local storage instead
         of iCloud for users who don't have 
         iCloud enabled
v1.3.0 - (new) hastebin.com support
v1.2.0 - (update)renamed to Import-Script.js
       - (fix) script names with spaces are saved 
         with URL Encoding
v1.1.1 - fix gist error introduced in v1.1
v1.1.0 - support for gists with multiple files
v1.0.0 - Initial releast
----------------------------------------------- */

// detect is icloud is used
const USE_ICLOUD =  module.filename.includes('Documents/iCloud~')

let url;
let data;

// if there are no urls passed via the share sheet
// get text from the clipboard
if (args.urls.length > 0) {
  input = args.urls[0]
} else if (args.queryParameters.url) {
  input = args.queryParameters.url
} else {
  input = Pasteboard.paste()
}


//await presentAlert(`[${input}]`)

// exit if there's no input
if (!input) {
  log('nothing to work with')
  return
}

log(`input: ${input}`)

// identify if the input is one of the supported
// websites. if not, then it might be raw code.
// ask the user about it
var urlType = getUrlType(input)
log(urlType)
//await presentAlert(JSON.stringify(urlType))
if (!urlType) {
  let resp = await presentAlert('Unable to identify urls from the input. Is it already the actual code?', ["Yes","No"])
  if (resp==0) {
    urlType = {name:'code'}
  } else {
    await presentAlert('Unsupported input.')
    return
  }
}

// store the information into a common structure
switch (urlType.type) {
  case 'repo': 
    data = await pickFileFromRepo(input, '')
    break;
  case 'repo-folder':
    data = await pickFileFromRepo(urlType.slices[urlType.repoIndex], urlType.slices[urlType.pathIndex])
    break;
  case 'repo-file': 
    data = await getRepoFileDetails(urlType.slices[urlType.repoIndex],urlType.slices[urlType.pathIndex])
    break;
  case 'raw': 
    var slices = input.match(urlType.regex)
    data = {
      source: 'rawurl',
      name: decodeURIComponent(`${urlType.slices[urlType.nameIndex]}${urlType.extension}`),
      download_url: input
    }
    break;
  case 'gist': 
    data = await pickFileFromGist(urlType.slices[urlType.idIndex])
    break;
  case 'pastebin': 
    data = {
      source: 'pastebin',
      name: `${urlType.slices[urlType.nameIndex]}${urlType.extension}`,
      download_url: input.replace('.com','.com/raw')
    }
    break;
  case 'code':
    data = {
      source: 'raw',
      name: 'Untitled.js',
      code: input
    }  
    break;
  default:
}

log('data')
log(data)

if (data) {
  let importedFile = await importScript(data)
  if (importedFile) {
    await presentAlert(`Imported ${importedFile}`,["OK"])
  }
  return
}

//------------------------------------------------
function getUrlType(url) {
  const typeMatchers = [
    {name: 'gh-repo',         
      regex: /^https:\/\/github.com\/[^\s\/]+\/[^\s\/]+\/?$/,
      type: 'repo',
      repoIndex: 0
    },
    {name: 'gh-repo-folder',  
      regex: /^(https:\/\/github.com\/[^\s\/]+\/[^\s\/]+)\/tree\/[^\s\/]+(\/[^\s]+\/?)$/ ,
      type: 'repo-folder',
      repoIndex: 1,
      pathIndex: 2
    },
    {name: 'gh-repo-file-noblob',  
      regex: /^(https:\/\/github.com\/[^\s\/]+\/[^\s\/]+)\/(?!blob)([^\s]+\.[a-zA-Z\d]+)$/,
      type: 'repo-file',
      repoIndex: 1,
      pathIndex: 2
    },
    {name: 'gh-repo-file',    
      regex: /^(https:\/\/github.com\/[^\s\/]+\/[^\s\/]+)\/blob\/[^\s\/]+(\/[^\s]+)$/,
      type: 'repo-file',
      repoIndex: 1,
      pathIndex: 2
    },
    {name: 'gh-repo-raw',     
      regex: /^https:\/\/raw\.githubusercontent\.com(\/[^\/\s]+)+\/([^\s]+)/,
      type: 'raw',
      nameIndex: 2
    },
    {name: 'gh-gist',         
      regex: /^(https:\/\/gist\.github.com\/)([^\/]+)\/([a-z0-9]+)$/,
      type: 'gist',
      idIndex: 3
    },
    {name: 'gh-gist-raw',     
      regex: /^https:\/\/gist\.githubusercontent\.com\/[^\/]+\/[^\/]+\/raw\/[^\/]+\/(.+)$/,
      type: 'raw',
      nameIndex: 1
    },
    {name: 'pastebin-raw',    
      regex: /^https:\/\/pastebin\.com\/raw\/([a-zA-Z\d]+)$/,
      type: 'raw',
      nameIndex: 1,
      extension: '.js'
    },
    {name: 'pastebin',        
      regex: /^https:\/\/pastebin\.com\/(?!raw)([a-zA-Z\d]+)/,
      type: 'pastebin',
      nameIndex: 1,
      extension: '.js'
    },
    {name: 'hastebin',        
      regex: /^https:\/\/hastebin\.com\/([a-z]+\.[a-z]+)$/,
      type: 'pastebin',
      nameIndex: 1
    },
    {name: 'hastebin-raw',    
      regex: /^https:\/\/hastebin\.com\/raw\/([a-z]+\.[a-z]+)$/,
      type: 'raw',
      nameIndex: 1
    }
  ]
  let types = typeMatchers.filter( matcher => {
    return matcher.regex.test(url)
  })

  var type;
  if (types.length) {
    type = types[0]
    type['slices'] = url.match(type.regex)
    if (!type.hasOwnProperty('extension')) {
      type.extension = ''
    }
  }

  return type
}
//------------------------------------------------
async function pickFileFromRepo(url, path) {

  log('fn:pickFileFromRepo')
  log(`url = ${url}`)
  log(`path = ${path}`)

  url = url.replace(/\/$/,'')
  const apiUrl = url.replace('/github.com/',
                          'api.github.com/repos/')

  log(`apiURL=${apiUrl}`)

  let req = new Request(apiUrl)
  try {
    var data = await req.loadJSON()
  } catch (e) {
    await presentAlert("Unable to fetch repo information. Likely due to api limits", ["OK"])
    return null
  }
  
  let contents_url = data.contents_url
  log(`contents_url = ${contents_url}`)

  // get contents
  contents_url = contents_url.replace('{+path}',path)
  req = new Request(contents_url)
  try {
    var contents = await req.loadJSON()
  } catch (e) {
    await presentAlert("Unable to fetch repo information. Likely due to api limits", ["OK"])
    return null
  }
  
  log(contents.map(c=>c.name).join("\n"))

  let table = new UITable()
  let list = []

  // add a .. entry if path is passed
  if (path) {
    list.push({
      name: '..',
      type: 'dir',
      path: '..'
    })
  }

  list.push(contents)
  list = list.flat().sort( (a,b) => {
    if (a.type==b.type) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      }
    } else {
      if (a.type == 'dir' ) {
        return -1
      } else if (b.type == 'dir' ) {
        return 1
      }
    }

    return 0
  })
  
  let selected;
  list.forEach( content => {
    const row = new UITableRow()

    let name = content.name
    let display_name = content.type == 'dir' ? `${name}/` : name
    if (name=='..') display_name = name
 
    let icon = content.type=='dir'?(name=='..'?'arrow.left':'folder'):'doc'
    let sfIcon = SFSymbol.named(`${icon}.circle`)
    sfIcon.applyFont(Font.systemFont(25))
    let img = sfIcon.image
    let iconCell = row.addImage(img)
    iconCell.widthWeight = 10
    iconCell.centerAligned()

    let nameCell = row.addText(display_name)
    nameCell.widthWeight = 90

    row.onSelect = (index) => {
      selected = list[index]
    }

    table.addRow(row)
  })

  let resp = await table.present()

  if (!selected) return null

  log(selected.name)
  
  if (selected.type == 'dir') {
      if (selected.name == '..') {
        const lastPath = path.split('/').reverse().slice(1).reverse().join('/')
        selected = await pickFileFromRepo(url, lastPath)
      } else {
        selected = await pickFileFromRepo(url, selected.path)
      }
  }

  if (selected) {
    return {
      source: 'repo',
      name: selected.name,
      download_url: selected.download_url
    }
  } 
  return null
}
//------------------------------------------------
async function getRepoFileDetails(repoUrl, path) {

  repoUrl = repoUrl.replace(/\/$/,'')
  path = path.replace(/^\//,'')

  log(`repo ${repoUrl}`)
  log(`path ${path}`)
  path = path.replace(/blob\/[^\/]+/,'')
  log(`path ${path}`)

  let apiUrl = repoUrl.replace('/github.com/',`api.github.com/repos/`)
  apiUrl = `${apiUrl}/contents/${path}`
  const req = new Request(apiUrl)
  try {
    var resp = await req.loadJSON()
    log(resp)
    if (resp.message) {
      await presentAlert(resp.message)
      return null
    }
    
  } catch(e) {
    log(e.message)
    await presentAlert(`Unable to fetch repo information - ${e.message}`, ["OK"])
    return null
  }

  const data = {
    source: 'repo',
    name: resp.name,
    path: resp.path,
    download_url: resp.download_url
  }
  return data

}
//------------------------------------------------
async function pickFileFromGist(gistId) {
  let apiUrl = `https://api.github.com/gists/${gistId}`  
  log(apiUrl)
  const req = new Request(apiUrl)

  try {
    var gist = await req.loadJSON()
  } catch(e) {
    await presentAlert("Unable to fetch repo information. Likely due to api limits", ["OK"])
    return null
  }

  let filenames = Object.keys(gist.files)
  log(filenames)
  // don't show browser if just one file
  if (filenames.length == 1) {
    let file = gist.files[filenames[0]]
    log(file)
    return {
      source: 'gist',
      name: file.filename,
      download_url: file.raw_url
    }    
  }

  let selected;

  let table = new UITable()
  filenames = filenames.sort()
  filenames.forEach( filename => {
    const row = new UITableRow()

    let sfIcon = SFSymbol.named(`doc.circle`)
    sfIcon.applyFont(Font.systemFont(25))
    let img = sfIcon.image
    let iconCell = row.addImage(img)
    iconCell.widthWeight = 10
    iconCell.centerAligned()

    let nameCell = row.addText(filename)
    nameCell.widthWeight = 90

    row.onSelect = (index) => {
      selected = filenames[index]
    }

    table.addRow(row)
  })

  await table.present()

  if (!selected) return null  

  if (selected) {
    let file = gist.files[selected]
    return {
      source: 'gist',
      name: file.filename,
      download_url: file.raw_url
    }
  } 


}
//------------------------------------------------
async function importScript(data) {
  
  var fm = USE_ICLOUD ? FileManager.iCloud() :
                        FileManager.local()
  
  log(`fn:importScript`)
  log(data.source)
  log(data.name)

  var code;
  var name = data.name

  if (data.source == 'raw' ) {
    code = data.code
  } else {
    let url = data.download_url
    let resp = await presentAlert(`Download ${name}?`,["Yes","No"])
    if (resp==0) {
      log(`downloading from ${url}`)
      const req = new Request(url)
      code = await req.loadString()
    }  
  }

  if (code) {

    let filename = name
    let fileExists = true

    while(fileExists) {
      filename = await presentPrompt("Save as", filename)
      log(filename)

      if (filename) {
        let savePath = fm.joinPath(fm.documentsDirectory(), filename)
        fileExists = fm.fileExists(savePath)
        log(fileExists)

        if (fileExists) {
          let resp = await presentAlert('File exists. Overwrite?',["Yes","No","Cancel"])
          if (resp==2) {
            fileExists = false
            filename = null
          } else {
            fileExists = resp == 1
          }
        }
      } else {
        fileExists = false
      }
    }

    if (filename) {
      log(`saving ${filename}`)
      const path = fm.joinPath(fm.documentsDirectory(), filename)
      fm.writeString(path, code)
      return filename
    }
  } 
  return null
}
//------------------------------------------------
async function presentAlert(prompt,items = ["OK"],asSheet) 
{

  let alert = new Alert()
  alert.message = prompt
  
  for (const item of items) {
    alert.addAction(item)
  }
  let resp = asSheet ? 
    await alert.presentSheet() : 
    await alert.presentAlert()
  log(resp)
  return resp
}
//------------------------------------------------
async function presentPrompt(prompt,defaultText) 
{
  let alert = new Alert()
  alert.message = prompt

  alert.addTextField("",defaultText)
  
  var buttons = ["OK", "Cancel"]
  for (const button of buttons) {
    alert.addAction(button)
  }
  let resp = await alert.presentAlert()
  if (resp==0) {
    return alert.textFieldValue(0)
  }
  return null
}
