// file to run extendscript and exit.

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const delay = require('./utils/delay');

// Paths
const estkPath = 'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe';
const jsxScriptPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/updateTemplateWithVariables.jsx');
const autoHotkeyPath = '"C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"';
const autoHotkeyRunScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/run_extendScript.ahk');
const autoHotkeyExiteScript = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/exit_extendScript.ahk');

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


// Main execution flow
async function main() {
    try {
        await runJSXWithESTK(); // Launch ExtendScript Toolkit
        await delay(10000); // Wait for the script to load - WARNING - DOES NOT WORK IF SCRIPT OPENING TAKES LONGER THAN 10S
        await runAutoHotkey(autoHotkeyRunScript); // Trigger F5 in ExtendScript Toolkit
        console.log("AutoHotkey run script executed.");

        // Wait for some time to ensure the script finishes before exiting
        await delay(60000); // Adjust duration as needed - WARNING - DOES NOT WORK IF SCRIPT EXECUTION TAKES LONGER THAN 60S
        await exitESTK(); // Force exit ExtendScript Toolkit
        
    } catch (error) {
        console.error("Error during execution:", error);
    }
}

// Execute the sequence
//main();

module.exports = main;
