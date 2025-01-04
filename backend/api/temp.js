// Temproary file for testing

// requires...
const express = require('express');
const connectDB = require('../db'); // import the db connection
const uploadFileContent = require('../utils/uploadFileContent');
const readJsonFile = require('../utils/readJsonFile');
const uploadToGoogleDrive = require('../utils/googleDriveUpload');
const downloadFromGoogleDrive = require('../utils/googleDriveDownload');
const runExtendScript = require('../runExtendScript');
const createJsonFile = require('../utils/createJsonFile');
const deleteJsonFile = require('../utils/deleteJsonFile');
const { validateTemplateData, validateOrExit } = require('../utils/validateTemplateData');
const delay = require('../utils/delay');
require("dotenv").config({ path: '../.env' });
const fs = require('fs');
const fsPromises = require("fs/promises");
const path = require('path');
const sharp = require('sharp');
const app = express();
const File = require('../models/file'); // mongoose schema


// For generativeAI
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { clear } = require('console');
const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.GOOGLE_API_KEY;


// Hardcoded user image path
var userImagePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.png'); // gets overwritten later
const resizedImagePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/resized_user_photo.png');
// Write to tempData.json
const jsonFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/output.json');
const folderOutputPath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/');


// Connect to the database before setting up routes
connectDB().then(() => {
  console.log('No errors with DB connection.');
}).catch((err) => {
  console.error("Failed to connect to DB:", err);
  process.exit(1); // Exit if DB connection fails
});

// Orchestrator function to enforce order
async function orchestrateAppFunctions() {
    try {
      console.log("Starting Poster Assistant Program...\n");
      //newObjectId = await uploadFileContent('../output.json', 'output.json', 'application/json'); // upload to mongodb
      const userImagePath = "D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.jpg";
      const response = await downloadFromGoogleDrive("https://drive.google.com/file/d/1NlEsi_IpiBqrr9Qoq7PqpcrVhNpOj3DM/view?usp=sharing", userImagePath);
      console.log("All tasks completed sequentially.");
    } catch (error) {
      console.error("An error occurred while executing Poster Assistant:", error);
      process.exit(1); // Exit with failure code
    }
  }
  
  // Start the sequence (for testing only)
  orchestrateAppFunctions();




// getCarInfo function (AI)
const getCarInfo = async (imageBuffer) => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 1024,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    {
      text: `Accurately identify the vehicle make, model and year with your analysis. Then write a description of that exact model with that year. Ensure the description is around 100 words. Please respond in the following JSON format:

    {
      "vehicle": {
        "make": "string",
        "model": "string",
        "year": "string",
        "description": "string"
      }
    }

    If the image does not contain a vehicle, respond in this format:
    {
      "error": "The image does not contain a vehicle."
    }

    Example responses:

    For a successful identification:
    {
      "vehicle": {
        "make": "Nissan",
        "model": "Skyline",
        "year": "1995",
        "description": "The Nissan Skyline R33 GT-R, produced from 1995 to 1998, is a legendary Japanese sports car that built upon the legacy of the GT-R lineage with significant advancements in technology and performance. Powered by the revered 2.6-liter twin-turbo RB26DETT inline-six engine, it features the advanced ATTESA E-TS all-wheel-drive system and Super-HICAS rear-wheel steering, enhancing grip and handling at high speeds and in tight corners. Celebrated by enthusiasts for its performance, durability, and tunability, the R33 GT-R holds a special place in automotive history and continues to be a sought-after model for collectors and driving purists alike."
      }
    }

    If the vehicle's year cannot be exactly determined, simply insert the first year that the model was introduced." (e.g., "2002").`,
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBuffer.toString("base64"),
      },
    },
  ];


  // ------------- uncomment FOR GEMINI DATA -------------------

  // const result = await model.generateContent({
  //   contents: [{ role: "user", parts }],
  //   generationConfig,
  //   safetySettings,
  // });

  // const response = result.response.text()
  //   .replace(/```json/g, "")
  //   .replace(/```/g, "");

  // // Parse the JSON string into an JS object
  // let carInfo;
  // try {
  //   carInfo = JSON.parse(response);
  //   //console.log("Parsed carInfo:", carInfo);
  // } catch (error) {
  //   console.error("Error parsing JSON response:", error.message);
  //   throw error; // Rethrow or handle appropriately
  // }

  // // Now carInfo can be used as a JS object
  // return carInfo;

  // ------------- uncomment FOR DUMMY DATA -------------------

  return carInfo = {
    vehicle: {
      make: 'Nissan',
      model: '350Z',
      year: '2002',
      description: "The Nissan 350Z, introduced in 2002, marked a triumphant return to Nissan's sports car heritage.  With its sleek, aggressive styling, the 350Z captivated enthusiasts. Its naturally aspirated 3.5-liter V6 engine, known as the VQ35DE, delivered thrilling performance and a distinctive exhaust note.  The 350Z offered a balanced chassis, making it a joy to drive on winding roads.  Available as a coupe or roadster, the 350Z provided an exhilarating driving experience at an accessible price point, solidifying its place as a modern classic."
    }
  };
};


// Async function to handle resizing and then read the file, before sending it to Gemini API. It then updates the JSON file based on the API response.
async function processImage() {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(resizedImagePath);
    await fsPromises.mkdir(outputDir, { recursive: true });

    // Resize the image and save it
    await sharp(userImagePath)
      .resize(800) // Resize to a width of 800px (maintaining aspect ratio)
      .toFile(resizedImagePath);

    console.log("Image resized and saved to:", resizedImagePath);

    // Read the resized image
    const imageBuffer = await fsPromises.readFile(resizedImagePath);
    console.log("Resized image buffer ready for API request.");

    // Call the getCarInfo function and wait for its result --- SENDS TO GEMINI
    const carInfo = await getCarInfo(imageBuffer);

    // Read and update the JSON file
    const jsonData = await fsPromises.readFile(jsonFilePath, "utf8");
    const tempJson = JSON.parse(jsonData);

    // Update vehicle and added fields
    tempJson.vehicle = {
      make: carInfo.vehicle.make,
      model: carInfo.vehicle.model,
      year: carInfo.vehicle.year,
      description: carInfo.vehicle.description,
    };

    // update pngs for make and model
    tempJson.added.makePng = carInfo.vehicle.make.toLowerCase() + ".png";
    tempJson.added.modelPng = carInfo.vehicle.model.toLowerCase() + ".png";

    // Write the updated JSON back to the file
    await fsPromises.writeFile(jsonFilePath, JSON.stringify(tempJson, null, 4));
    console.log("JSON file updated successfully with GEMINI data.");
  } catch (err) {
    console.error("Error during image processing:", err);
    throw err; // Rethrow the error to ensure the orchestrator is aware
  }
}


// populates local json file (for testing purposes only) FIXME: This will be removed in the future and updated by network!
async function populateJsonFile(filePath) {
  const updatedData = {
    vehicle: {
      make: "",
      model: "",
      year: "",
      description: ""
    },
    template: {
      path: "D:/Documents/GithubRepos/PosterAssistant/templates/",
      name: "Preset_C_1_2.psd"
    },
    photo: {
      path: "D:/Documents/GithubRepos/PosterAssistant/photos/",
      name: "user_photo.jpg"
    },
    added: {
      path: "D:/Documents/PosterAssistantLocal/PNGS/", //Note: jsx script adds the subpaths to each MAKE, MODEL and EXTRAS folder.
      makePng: "",
      modelPng: "",
      add1: "bbs.png",
      add2: ""
    }
  };

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(updatedData, null, 4), 'utf8', (err) => {
      if (err) {
        console.error("Error updating JSON file:", err);
        reject(err);
      } else {
        console.log("JSON file updated successfully:", filePath);
        resolve();
      }
    });
  });
}

// function to retrieve the user photo path from json file
async function getUserPhotoPath(filePath) {
  try {
    // Read the file contents
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    // Parse the JSON content into an object
    const data = JSON.parse(fileContents);

    // Combine photo path and name
    const userPhotoPath = path.join(data.photo.path, data.photo.name);

    return userPhotoPath;
  } catch (error) {
    console.error("Error reading or parsing the JSON file:", error.message);
    return null;
  }
}

async function clearTempFiles() {
  //await deleteJsonFile('../output.json'); // redundant
  //await fsPromises.unlink(resizedImagePath); // redundant
  //await fsPromises.unlink(userImagePath); // redundant
  await fsPromises.rm(folderOutputPath, { recursive: true, force: true });
  console.log("Output folder deleted successfully.");
}


// Export the Express app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);
};
