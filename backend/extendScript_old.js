// 1) Runs updateTemplateWithVariables.jsx
// 2) Takes ExportedImage.png and uploads to Google drive

const { exec } = require('child_process');
const path = require('path');

// Path to the ExtendScript Toolkit executable (ensure it's correctly quoted)
const estkPath = 'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe';

// Path to the JSX script you want to run (resolved correctly)
const jsxScriptPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/updateTemplateWithVariables.jsx');

// Path to the AutoHotkey executable (correctly quoted)
const autoHotkeyPath = '"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"'; // Ensure the correct path and quotes

// Path to the AutoHotkey script
const autoHotkeyScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/run_extendScript.ahk');  // Update this with the correct path

const fs = require('fs');
const { google } = require('googleapis');
const dotenv = require('dotenv').config();

// Path to the outputted PNG file from jsx script
const exportFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/ExportedImage.png');

// Set the path to your credentials file
const credentialsPath = path.join(__dirname, 'credentials.json');



// Function to run the JSX script using ExtendScript Toolkit
function runJSXWithESTK() {
    // Open ExtendScript Toolkit with the JSX script
    const command = `"${estkPath}" "${jsxScriptPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing JSX script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`ExtendScript Toolkit output: ${stdout}`);


        // Call function to export to Google drive
        //uploadToGoogleDrive();

    });

    // After opening ExtendScript Toolkit, wait for a brief period to ensure it has loaded
    setTimeout(() => {
        // Run AutoHotkey script to trigger F5
        exec(`${autoHotkeyPath} "${autoHotkeyScript}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing AutoHotkey script: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`AutoHotkey output: ${stdout}`);
        });
    }, 2000);  // 2 seconds delay, adjust as needed
}

// Call the function to run the script
runJSXWithESTK();







//
// Authenticate with the service account
async function authenticateDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,  // Path to the service account JSON
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  return drive;
}

// Upload PNG file to Google Drive
async function uploadToGoogleDrive() {
    try {
        const drive = await authenticateDrive();
        console.log("Google user authenticated successfully.");

        const fileMetadata = {
            name: 'ExportedImage.png',
            parents: ['1XDaRtbegICg_Mmog9bwYyVHTX1G8i9m7'] // Replace with your folder ID
        };

        const media = {
            mimeType: 'image/png',
            body: fs.createReadStream(exportFilePath)
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });

        console.log("File uploaded successfully. File ID:", response.data.id);
    } catch (err) {
        console.error("Error uploading file:", err);
    }
}
