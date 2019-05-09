const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), init);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    console.log(redirect_uris)
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function init(auth) {
    const drive = google.drive({ version: 'v3', auth });

    // Find file id of the folder where we will upload the file
    getFolderData(drive, 'testeando')
        .then(
            folderData => {
                if (folderData) {
                    uploadImg(drive, folderData.id);
                }
            }
        )
    
}

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
                // res.data.files &&
                // res.data.files.some(
                //     f => 
                //         f.name === folderName &&
                //         f.mimeType === 'application/vnd.google-apps.folder'
                // )
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
