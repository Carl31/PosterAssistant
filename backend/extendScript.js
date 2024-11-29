const { spawn, exec } = require('child_process');
const { google } = require('googleapis');
const path = require('path');

// Paths
const estkPath = 'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe';
const jsxScriptPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/updateTemplateWithVariables.jsx');
const autoHotkeyPath = '"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"';
const autoHotkeyRunScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/run_extendScript.ahk');
const autoHotkeyExiteScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/exit_extendScript.ahk');
const credentialsPath = path.join(__dirname, 'credentials.json');

// Utility function to delay execution
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run ExtendScript Toolkit in detached mode
function runJSXWithESTK() {
    return new Promise((resolve, reject) => {
        const estkProcess = spawn(estkPath, [jsxScriptPath], {
            detached: true,
            stdio: 'ignore',
        });

        estkProcess.on('error', (err) => {
            reject(new Error(`Failed to launch ExtendScript Toolkit: ${err.message}`));
        });

        estkProcess.unref();
        console.log("ExtendScript Toolkit launched in detached mode.");
        resolve();
    });
}

// Run AutoHotkey script
function runAutoHotkey(scriptPath) {
    return new Promise((resolve, reject) => {
        const command = `${autoHotkeyPath} "${scriptPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error executing AutoHotkey script: ${error.message}`));
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`AutoHotkey script output: ${stdout}`);
            resolve();
        });
    });
}

// Exit ExtendScript Toolkit using AutoHotkey
async function exitESTK() {
    console.log("Attempting to close ExtendScript Toolkit...");
    await runAutoHotkey(autoHotkeyExiteScript);
    console.log("ExtendScript Toolkit exited successfully.");
}

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
  

// Main execution flow
async function main() {
    try {
        await runJSXWithESTK(); // Launch ExtendScript Toolkit
        await delay(2000); // Wait for the script to load
        await runAutoHotkey(autoHotkeyRunScript); // Trigger F5 in ExtendScript Toolkit
        console.log("AutoHotkey run script executed.");

        // Wait for some time to ensure the script finishes before exiting
        await delay(60000); // Adjust duration as needed - WARNING - DOES NOT WORK IF SCRIPT TAKES LONGER THAN 60S
        await exitESTK(); // Force exit ExtendScript Toolkit

        // Call function to export to Google drive
        //uploadToGoogleDrive();
    } catch (error) {
        console.error("Error during execution:", error);
    }
}

// Execute the sequence
main();
