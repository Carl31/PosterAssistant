const fs = require('fs');
const File = require('../models/file'); // mongoose schema

// read file from db
async function readJsonFile(fileId) {
    try {
        // Find the file by its ID
        const file = await File.findById(fileId);
        if (!file) {
            console.error('File not found!');
            return;
        }

        // Decode the binary data and parse it as JSON
        const jsonData = JSON.parse(file.data.toString());
        console.log('Decoded JSON data:', jsonData);

        return jsonData;
    } catch (err) {
        console.error('Error reading JSON file:', err);
    }
}

module.exports = readJsonFile;