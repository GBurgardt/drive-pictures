const fs = require('fs');
const util = require('util');

// Promisify readFile callbalck function
const readFileAsync = util.promisify(fs.readFile);

readCredentialsFile = (credentialsPath) => 
    readFileAsync(credentialsPath)
        .then( 
            (err, content) => {
                if (err) return err;

                return JSON.parse(content);
            }
        )

/**
 * 
 * @param {*} drive Drive API instance
 * @param {*} idFather Father's folder id
 */
uploadImg = (drive, idFather) => {
    
    const fileMetadata = {
        'name': 'photo.jpg',
        parents: [idFather]
    };

    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream('files/photo.jpg')
    };

    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, (err, file) => {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log('File Id: ', file.id);
        }
    });
    
         


}

/**
 * To create folder in drive
 */
createFolder = (drive, nameFolder) => {
    var fileMetadata = {
        'name': nameFolder,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    }, function (err, file) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            console.log('Folder Id: ', file.id);
        }
    });
}

/**
 * Check if exist a folder in Drive
 */
getFolderData = (drive, folderName) => 
    filesListPromise(drive, { pageSize: 10 })
        .then(
            res => 
                res.data.files.find(
                    f => 
                        f.name === folderName &&
                        f.mimeType === 'application/vnd.google-apps.folder'
                )
        )
        .catch(
            err => console.log('The API returned an error: ' + err)
        )


/**
 * drive.files.list promise wrapped
 */
filesListPromise = (drive, paramsList) =>
    new Promise(
        (resolve, reject) => 
            drive.files.list(
                paramsList, 
                (err, res) => 
                    resolve(res) &&
                    reject(err)
            )
        
    )



exports.readCredentialsFile = readCredentialsFile;
exports.uploadImg = uploadImg;
exports.getFolderData = getFolderData;