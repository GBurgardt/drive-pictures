const chokidar = require('chokidar');
const homedir = require('os').homedir();
const driveFilesService = require('./drive-files-service');

/**
 * Wath Pictures folder for changes, and upload new pictures
 */
syncPicturesFolder = (drive, idFolderDrive) => {
    const namePicturesFolder = 'Pictures';

    chokidar.watch(`${homedir}/${namePicturesFolder}`, { ignored: /(^|[\/\\])\../, ignoreInitial: true })
        .on(
            'add', 
            (path, event) => {

                const nameFile = path.substring(
                    path.indexOf(namePicturesFolder) + namePicturesFolder.length + 1
                );

                driveFilesService.uploadImgFile(
                    drive,
                    idFolderDrive,
                    path,
                    nameFile
                )
                    

            }
        )
}


exports.syncPicturesFolder = syncPicturesFolder;