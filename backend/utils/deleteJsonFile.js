const fs = require('fs');

// deletes json locally
async function deleteJsonFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File deleted successfully:", filePath);
            }
        });
    } else {
        console.log("File not found:", filePath);
    }
}

module.exports = deleteJsonFile;