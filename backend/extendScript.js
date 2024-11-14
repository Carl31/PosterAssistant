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