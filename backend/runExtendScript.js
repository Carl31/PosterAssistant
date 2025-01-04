// File to run extendscript and exit.

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const delay = require('./utils/delay');

// Paths
const estkPath = 'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe';
const jsxScriptPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/updateTemplateWithVariables.jsx');
const autoHotkeyPath = '"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"';
const autoHotkeyRunScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/run_extendScript.ahk');
const autoHotkeyExitScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/exit_extendScript.ahk');

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
            console.log(`AutoHotkey run script finished. Output: ${stdout}`);
            resolve();
        });
    });
}

// Exit ExtendScript Toolkit using AutoHotkey
async function exitESTK() {
    console.log("Attempting to close ExtendScript Toolkit...");
    await runAutoHotkey(autoHotkeyExitScript);
    console.log("ExtendScript Toolkit exited successfully.");
}

// Checks for the script to complete
async function waitForCompletion(signalFile) {
    console.log("Waiting for Photoshop script to finish..");
    while (!fs.existsSync(signalFile)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every 1 second
    }
    console.log("Script completed.");
    await delay(3000); // Wait a bit for the script to finish

    // Delete the signal file after detection
    try {
        fs.unlinkSync(signalFile);
        console.log("Signal file deleted.");
    } catch (err) {
        console.error("Error deleting signal file:", err);
    }
}

/**
 * Continuously wait until ExtendScript Toolkit is open
 * @returns {Promise<void>} Resolves when the process is detected
 */
async function waitForESTKProcess() {
    console.log('Checking if ExtendScript Toolkit is open...');
    while (!(await isESTKOpen())) {
        //console.log('ExtendScript Toolkit not open. Waiting...');
        await delay(2000); // Wait 2 seconds before rechecking
    }
    console.log('ExtendScript Toolkit is open! Proceeding...');
    await delay(10000); // Wait for the script to load
}

/**
 * Check if ExtendScript Toolkit process is running
 * @returns {Promise<boolean>} Resolves to true if process is running, false otherwise
 */
function isESTKOpen() {
    return new Promise((resolve, reject) => {
        const processName = process.platform === 'win32' ? 'ExtendScript Toolkit.exe' : 'ExtendScript Toolkit';

        exec(process.platform === 'win32' ? 'tasklist' : 'ps -A', (err, stdout, stderr) => {
            if (err) {
                reject(`Error checking processes: ${stderr}`);
                return;
            }
            resolve(stdout.toLowerCase().includes(processName.toLowerCase()));
        });
    });
}


// Main execution flow
async function main() {
    try {
        await runJSXWithESTK(); // Launch ExtendScript Toolkit
        await waitForESTKProcess(); // Wait for ExtendScript Toolkit to open
        await runAutoHotkey(autoHotkeyRunScript); // Trigger F5 in ExtendScript Toolkit (which runs the script)
        await waitForCompletion('D:/Documents/GithubRepos/PosterAssistant/backend/done.txt'); // checks for a done.txt which indicated script is finished.
        await exitESTK(); // Force exit ExtendScript Toolkit
        await delay(5000); // wait for photoshop to close.
        
    } catch (error) {
        console.error("Error during execution:", error);
    }
}

// Execute the sequence
//main();

module.exports = main;
