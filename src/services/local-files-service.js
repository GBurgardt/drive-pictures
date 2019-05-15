const chokidar = require('chokidar');
const homedir = require('os').homedir();
const driveFilesService = require('./drive-files-service');

/**
 * Wath Pictures folder for changes, and upload new pictures
 */
syncPicturesFolder = (drive, idFolderDrive) => {
    const namePicturesFolder = 'Pictures';

    return new Promise(
        (resolve, reject) => 
            
            chokidar.watch(`${homedir}/${namePicturesFolder}`, { ignored: /(^|[\/\\])\../, ignoreInitial: true })
                .on(
                    'add', 
                    (path, event) => {
        
                        const nameFile = path.substring(
                            path.indexOf(namePicturesFolder) + namePicturesFolder.length + 1
                        );

                        console.log('New picture detected..')
        
                        driveFilesService.uploadImgFile(drive, idFolderDrive, path, nameFile)
                            .then(resp => resolve(resp))
                            .catch(err => reject(err))
                        

                            
                    }
                )
            
        
    )
}


exports.syncPicturesFolder = syncPicturesFolder;

