const fs = require('fs');
const { google } = require('googleapis');
const { CREDENTIAL_PATH } = require('./constants/paths')
const { FOLDER_DRIVE_NAME, API_FIREBASE_VERSION, DRIVE_FOLDER_PATH } = require('./constants/config')

const driveAuthService = require('./services/drive-auth-service');
const driveFilesService = require('./services/drive-files-service');
const locaFilesService = require('./services/local-files-service');


driveAuthService.connectDrive(CREDENTIAL_PATH)
    .then(auth => {
        const drive = google.drive({ version: API_FIREBASE_VERSION, auth });

        console.log('Searching data folder in local..');
        
        fs.readFile(DRIVE_FOLDER_PATH, (err, fileFolderData) => {
            if (err) {
                console.log('No data folder found, then create folder in drive an store in local data folder..')
                driveFilesService.createFolder(drive, FOLDER_DRIVE_NAME)
                    .then(
                        newFolder => {
                            const folderData = newFolder.data;

                            fs.writeFile(DRIVE_FOLDER_PATH, JSON.stringify(folderData), (err) => {
                                if (err) return console.error(err);
                                console.log('Data folder stored to', DRIVE_FOLDER_PATH);
                            })

                            locaFilesService.syncPicturesFolder(drive, folderData.id)
                        }
                    )
            } else {

                const folderData = JSON.parse(fileFolderData)
                locaFilesService.syncPicturesFolder(drive, folderData.id)
            }
            
        });

        // driveFilesService.findFileById(drive, idFolder)
        //     .then(
        //         folderData => {
        //             // Si ya existe la carpeta la uso. Si no existe, creo una nueva
        //             if (folderData) {
        //                 // Escucho cambios en Pictures folder y voy subiendo los cambios a la carpeta encontrada
        //                 locaFilesService.syncPicturesFolder(drive, folderData.id)
        //             } else {
        //                 driveFilesService.createFolder(drive, FOLDER_DRIVE_NAME).then(
        //                     newFolderData => locaFilesService.syncPicturesFolder(drive, newFolderData.data.id)
        //                 )
        //             }
        //         }
        //     )
        //     .catch(err => {
        //         console.log(err)
        //     })  


    })
    .catch(err => console.log(err))