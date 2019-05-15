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
uploadImgFile = (drive, idFather, localPath, fileName) => {
    
    const fileMetadata = {
        name: fileName,
        parents: [idFather]
    };

    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(localPath)
    };


    return new Promise(
        (resolve, reject) => {
            drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            }, (err, file) => {
                
                if (err) {
                    reject(err)
                } else {
                    resolve(file)
                }
            })
        }
    )

}

/**
 * To create folder in drive, and store dataFolder in local
 */
createFolder = (drive, nameFolder) => 
    new Promise(
        (resolve, reject) => {

            console.log('Then create folder in drive..')

            const fileMetadata = {
                'name': nameFolder,
                'mimeType': 'application/vnd.google-apps.folder'
            };
        
            drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            }, (err, file) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(file)
                }
            });
        }
    )


/**
 * Finde file (or folder, that is a file) in Drive
 * image/jpeg
 * application/vnd.google-apps.folder
 */
findFile = (drive, name, mimeType) => 
    filesListPromise(drive, { 
        q: `mimeType = '${mimeType}' and name = '${name}'`
    })
        .then(
            res => {
                console.log(res.data.files)
                return res.data.files[0]
            }
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
exports.uploadImgFile = uploadImgFile;
exports.findFile = findFile;
exports.createFolder = createFolder;