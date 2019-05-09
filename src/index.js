const { google } = require('googleapis');
const { CREDENTIAL_PATH } = require('./constants/paths')

const driveAuthService = require('./services/drive-auth-service');
const driveFilesService = require('./services/drive-files-service');


driveAuthService.connectDrive(CREDENTIAL_PATH)
    .then(auth => {
        const drive = google.drive({ version: 'v3', auth });
    
        driveFilesService.getFolderData(drive, 'testeando')
            .then(
                folderData => {
                    if (folderData) {
                        driveFilesService.uploadImg(drive, folderData.id);
                    }
                }
            )    


    })
    .catch(err => console.log(err))