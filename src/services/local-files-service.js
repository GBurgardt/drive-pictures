const chokidar = require('chokidar');

const homedir = require('os').homedir();

const driveFilesService = require('./drive-files-service');


syncPicturesFolder = (drive, idFolderFirebase) => {
    const namePicturesFolder = 'Pictures';

    chokidar.watch(
        `${homedir}/${namePicturesFolder}`, 
        { ignored: /(^|[\/\\])\../ }
    ).on(
        'add', 
        (path, event) => {
            
            const nameFile = path.substring(
                path.indexOf(namePicturesFolder) + namePicturesFolder.length + 1
            );

            driveFilesService.uploadImgFile(
                drive,
                idFolderFirebase,
                path,
                nameFile
            )
                

        }
    );
}


exports.syncPicturesFolder = syncPicturesFolder;