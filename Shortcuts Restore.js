// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;
/* 
Name    : Shortcuts Restore
Author  : @supermamon
Version : 2.0.0
Changes :
    v2.0.0 | 2018-10-30
    - Removed the Tier-ring. Shortcuts restores
      the shortcut names in Run Shortcut ones the
      called shortcut is restored
    - Grant access to the Shortcuts folder using
      the document picker. Moving the backup
      folder manually is no longer needed
    v1.0.0 | 2018-09-29
    - Initial release     
Requires:
    Backup & Restore Shortcut 
    - https://routinehub.co/shortcut/613
Parameters
* restore_dir : the folder inside the Shortcuts
    folder where the backups are stored
* info_file   : filename of the backup information 
    (.json) file

Configure
* DEBUG = false : full import.
* DEBUG = true  : limited import
                : append "(restore)" to names

*/
const DEBUG = true;
const DEBUG_TEST_IMPORT_QTY = 2; 


const FM = FileManager.iCloud();
const params = URLScheme.allParameters();

// simulate parameters
// params['restore_dir']='Restore'
// params['info_file']  ='BackupInfo.json'

// let not run this without the required params
console.log('* Validating parameters')
if (isParamMissing('restore_dir')) {
    console.log('* Aborted.')
    return
}
if (isParamMissing('info_file')) {
    console.log('Aborted.')
    return
}

// how?
// 1. Navigate to the iCloud Drive root folder
// 2. Tap Select
// 3. Choose the Shortcuts folder
// 4. Tap Open
console.log('* Acquiring Shortcuts folder access')
let prompt = 'Please navigate to the iCloud ' +
            'Drive and open the Shortcuts folder.'
const shortcutsDirs = await promptForFolders(prompt);
const shortcutsDir = shortcutsDirs[0];

// append the restore path to the Shortcuts path
console.log('* Acquiring restore path')
const restore_dir = FM.joinPath(
                        shortcutsDir,
                        params['restore_dir']
                    );
console.log('  --> ' + restore_dir)

// load the .json file
console.log('* Getting backup information')
let info_file = params['info_file'];
info_file = 'BackupInfo.json';
const backup_info = loadBackupInfo(
                        restore_dir, 
                        info_file
                    )
console.log('  --> ' + backup_info.name)

// prepare the number of items and the list
console.log('* Getting the list of shortcuts')
const restore_list = backup_info.list_order;
const max_items = DEBUG?DEBUG_TEST_IMPORT_QTY:restore_list.length

console.log('* Ready to restore')
prompt = (DEBUG ? 'DEBUG MODE\n' : '' ) +
         `This will restore ${max_items} ` +
         'shortcuts! Focus will switch between ' + 
         'Shortcuts and Scriptable until the ' +
         'restoration is completed.'

if ( await confirm('Restore', prompt) == -1 ) {
    console.log('* Restore aborted by user.');
    return
}

console.log('* Restoring');
for (var i=0; i<max_items; i++) {
    // get the shortcut path
    let shortcut = restore_list[i] + '.shortcut'
    let sc_path = FM.joinPath(restore_dir,shortcut)

    // import it
    await importShortcut(sc_path)
}

// import done. show alert
console.log('* Restore completed.')
const alert = new Alert();
alert.title = 'Completed';
alert.message = 'Restore completed';
alert.addAction("OK");
await alert.presentAlert();

// go back to Shortcuts
Safari.open('shortcuts://')


// -----------------------------------------------
function isParamMissing(name) {
    let paramMissing = !params[name]
    if (paramMissing) {
        console.log('* Missing parameter - '+name)
    }
    return paramMissing
}

async function promptForFolders(msg) {
    const alert = new Alert();
    alert.title = 'Select Folder';
    alert.message = msg;
    alert.addAction("OK");
    await alert.presentAlert();
    let dirs = await DocumentPicker.open(["public.folder"]);
    return dirs;
}

async function confirm(title, msg) {
    const alert = new Alert();
    alert.title = title;
    alert.message = msg;
    alert.addDestructiveAction("Continue");
    alert.addCancelAction('Cancel')
    return await alert.presentAlert();
}

function loadBackupInfo(dir,filename) {
    const bi_path = FM.joinPath(dir, filename)
    const contents = Data.fromFile(bi_path)
    return JSON.parse(contents.toRawString())
}

async function importShortcut(shortcutPath) {
    // expects an absolute path
    if (!FM.fileExists(shortcutPath)) return;

    const scName = FM.fileName(shortcutPath,false);
    console.log(`importing > ${scName}`)

    // read the file and convert it into an 
    // encoded URL
    let d          = Data.fromFile(shortcutPath);
    let file       = d.toBase64String();
    let durl       = "data:text/shortcut;base64,"+file;
    let encodedUri = encodeURI(durl);
    console.log(`          > ${scName} loaded`)

    // callback to import it to the Shortcuts app
    const baseURL     = "shortcuts://import-shortcut";
    const url         = new CallbackURL(baseURL);
    url.addParameter("name",scName+(DEBUG?' (restored)':''));
    url.addParameter("url",encodedUri); 
    await url.open();
    console.log(`          > ${scName} sent for import`)

}
