const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const e = require('express');
const credentialsPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/credentials.json'); // for Google drive API
//const posterFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedPoster.png'); // for Google drive API
//const mockupFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedMockupImage.png'); // for Google drive API
//const mockupFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedMockupImage3D.png'); // for Google drive API
const exportsPath = "D:/Documents/GithubRepos/PosterAssistant/photos/output/";
const jsonFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/output.json'); // for Google drive API

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

// Upload poster PNG file to Google Drive, then saves to JSON
async function uploadPngToGoogleDrive(drive, fileName) {
    try {
        //const drive = await authenticateDrive();
        //console.log("Google user authenticated successfully.");

        const fileMetadata = {
            name: fileName + ".png",
            parents: ['1XDaRtbegICg_Mmog9bwYyVHTX1G8i9m7'] // Replace with your folder ID
        };

        const media = {
            mimeType: 'image/png',
            body: fs.createReadStream(exportsPath + fileName + ".png")
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });

        console.log("File (" + fileName + ".png) uploaded successfully to Google Drive. File ID:", response.data.id);

        // UPDATING JSON WITH DRIVE LINK:
        const fileId = response.data.id;
        const driveLink = `https://drive.google.com/file/d/${fileId}/view`; // for Google drive API

        try {
            // Read the JSON file
            const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
            const data = JSON.parse(jsonData);

            // Add or update the "output" object with the "link" key
            if (!data.output) {
                data.output = {};
            }
            //data.output.posterLink = driveLink; // FIXME: This overwrites the poster link in the json file.
            data.output[fileName] = driveLink;

            // Write the updated JSON back to the file
            fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 4), 'utf-8');
            console.log('JSON file updated successfully with Poster link.');
        } catch (error) {
            console.error('Error updating the JSON file:', error.message);
        }

    } catch (err) {
        console.error("Error uploading file:", err);
    }
}

async function main() {
    console.log("Starting Google Drive upload...");
    const drive = await authenticateDrive();
    await uploadPngToGoogleDrive(drive, "ExportedPoster");
    await uploadPngToGoogleDrive(drive, "Poster_Assistant_MOCKUP");
    await uploadPngToGoogleDrive(drive, "Poster_Assistant_MOCKUP_dark");
    //await uploadPngToGoogleDrive(drive, "ExportedMockupImage3D"); // DISABLED: Photoshop action not working properly
    
}

module.exports = main;