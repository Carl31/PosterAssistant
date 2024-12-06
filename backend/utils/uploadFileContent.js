const fs = require('fs');
const File = require('../models/file'); // mongoose schema


// upload file to mongodb and return id
async function uploadFileContent(filePath, fileName, fileType) {
    try {
        // Read file contents
        const fileData = fs.readFileSync(filePath);

        // Create a new file document
        const file = new File({
            name: fileName,
            data: fileData,
            type: fileType,
        });

        // Save the file to the database
        const savedFile = await file.save();

        // Log and return the file's _id
        console.log('JSON file saved successfully to MongoDB:', savedFile._id);
        return savedFile._id; // Return the generated _id
    } catch (err) {
        console.error('Error saving file content:', err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

module.exports = uploadFileContent;