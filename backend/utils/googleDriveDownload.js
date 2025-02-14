const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const e = require('express');
const credentialsPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/credentials.json'); // for Google drive API
const exportsPath = "D:/Documents/GithubRepos/PosterAssistant/photos/output/";
const axios = require('axios');

// Authenticate with the service account
async function authenticateDrive() {
    const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,  // Path to the service account JSON
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    console.log("Google user authenticated successfully.");

    return drive;
}

// Extracts the file ID from a Google Drive URL
function extractFileId(url) {
    const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
    const match = url.match(regex);

    if (match) {
        return match[1];
    } else {
        throw new Error('Invalid Google Drive URL'); // Note: this terminates the program if users drive link is invalid
    }
}

// Downloads a file from Google Drive and saves it to a local path (using axios)
async function downloadPngFromGoogleDrive(driveUrl, destinationPath) {

    // Below is the method for using google drive api - which doesnt work with downloading jpg files...

    // const drive = await authenticateDrive();
    // try {
    //     const response = await drive.files.get({
    //         fileId,
    //     });
    //     console.log('File Metadata:', response.data);
    // } catch (err) {
    //     console.error('Error retrieving file metadata:', err);
    // }


    // const dest = fs.createWriteStream(destinationPath);

    // try {
    //     const res = await drive.files.get(
    //         { fileId, alt: 'media' },
    //         { responseType: 'stream' }
    //     );

    //     await new Promise((resolve, reject) => {
    //         res.data
    //             .on('end', () => {
    //                 console.log(`Downloaded file to ${destinationPath}`);
    //                 resolve();
    //             })
    //             .on('error', err => {
    //                 console.error('Error downloading file:', err);
    //                 reject(err);
    //             })
    //             .pipe(dest);
    //     });
    // } catch (err) {
    //     console.error('API Error:', err);
    // }


    const fileId = extractFileId(driveUrl);
    const url = `https://drive.google.com/uc?id=${fileId}`;
    const writer = fs.createWriteStream(destinationPath);

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', (err) => {
                reject(err);
                console.log("Error downloading file: ", err);
              });
        });

        console.log(`File downloaded to ${destinationPath}`);
        writer.end();
        return true;
    } catch (error) {
        console.error('Error downloading file:', error);
    }


}



module.exports = downloadPngFromGoogleDrive;