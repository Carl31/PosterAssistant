const fs = require('fs');

// creates empty json file locally
async function createJsonFile(filePath) {
    const jsonData = {
        vehicle: {
            make: "",
            model: "",
            year: "",
            description: ""
        },
        template: {
            path: "",
            name: ""
        },
        photo: {
            path: "",
            name: ""
        },
        added: {
            path: "",
            makePng: "",
            modelPng: "",
            add1: "",
            add2: ""
        }
    };

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), (err) => {
            if (err) {
                console.error("Error creating JSON file:", err);
                reject(err);
            } else {
                console.log("JSON file created successfully:", filePath);
                resolve();
            }
        });
    });
}

module.exports = createJsonFile;