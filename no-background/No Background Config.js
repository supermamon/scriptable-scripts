// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: sliders-h;

/* -----------------------------------------------
Script      : No Background Config.js
Author      : me@supermamon.com
Version     : 1.0.0
Description :
  A companion script for no-background.js to 
  generate "slices" and clear the config file
----------------------------------------------- */

const nobg = importModule('no-background.js')

let resp = await presentAlert( 
  'No Background Configurator',
  [
    'Generate Slices',
    'Clear Widget Positions Cache',
    'Cancel'
  ])
switch (resp) {
  case 0:
    await nobg.generateSlices()
    break;
  case 1:
    await nobg.resetConfig()
    await presentAlert('Cleared',["OK"])
    break;
  default:
}

//------------------------------------------------
async function presentAlert(prompt,items,asSheet) 
{
  let alert = new Alert()
  alert.message = prompt
  
  for (const item of items) {
    alert.addAction(item)
  }
  let resp = asSheet ? 
    await alert.presentSheet() : 
    await alert.presentAlert()
  return resp
}