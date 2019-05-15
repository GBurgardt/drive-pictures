const fs = require('fs');
const { google } = require('googleapis');
const { CREDENTIAL_PATH, ID_FOLDER_DRIVE_PATH } = require('./constants/paths')
const { FOLDER_DRIVE_NAME, API_DRIVE_VERSION } = require('./constants/configDrive')

const driveAuthService = require('./services/drive-auth-service');
const driveFilesService = require('./services/drive-files-service');
const locaFilesService = require('./services/local-files-service');


driveAuthService.connectDrive(CREDENTIAL_PATH)
    .then(auth => {
        const drive = google.drive({ version: API_DRIVE_VERSION, auth });

        console.log('Searching data folder in local..');

        fs.readFile(ID_FOLDER_DRIVE_PATH, (err, fileFolderData) => {
            if (err) {
                console.log(err)
                console.log('No data folder found, then create folder in drive an store in local data folder..')

                createFolderAndWriteFile(drive);
            } else {

                console.log('Data folder finded! SYNC IS ON')

                const folderData = JSON.parse(fileFolderData)

                syncPictureFolder(drive, folderData);
            }

        });


    })
    .catch(err => console.log(err))


createFolderAndWriteFile = (drive) => {
    driveFilesService.createFolder(drive, FOLDER_DRIVE_NAME)
        .then(
            newFolder => {
                const folderData = newFolder.data;

                fs.writeFile(ID_FOLDER_DRIVE_PATH, JSON.stringify(folderData), (err) => {
                    if (err) return console.error(err);
                    console.log('Data folder stored to', ID_FOLDER_DRIVE_PATH);
                })

                console.log('Folder created sucess. SYNC IS ON')

                syncPictureFolder(drive, folderData)
            }
        )
}

syncPictureFolder = (drive, folderData) => {
    locaFilesService.syncPicturesFolder(drive, folderData.id)
        .then(
            imgMetaPromise => imgMetaPromise && imgMetaPromise.then ? 
                imgMetaPromise
                    .then(a => console.log('A picture was uploaded!'))
                    .catch(e => console.log('fasf')) 
                : 
                console.log('fafa')
        )
        .catch(err => 
            (err.code === 404) ?
                driveFilesService.createFolder(drive, FOLDER_DRIVE_NAME)
                    .then(resp => console.log('Folder created! SYNC ON')) 
                    .catch(err => console.log('Error in folder creation')) 
                : 
                console.log(err)
        )
}