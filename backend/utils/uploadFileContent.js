const fs = require('fs');
const File = require('../models/file'); // mongoose schema

// upload file to db
async function uploadFileContent(filePath, fileName, fileType) {
    try {
        const fileData = fs.readFileSync(filePath); // Read file contents
        const file = new File({
            name: fileName,
            data: fileData,
            type: fileType
        });
        await file.save();
        console.log('File content saved successfully:', file);
    } catch (err) {
        console.error('Error saving file content:', err);
    }
  }

  module.exports = uploadFileContent;