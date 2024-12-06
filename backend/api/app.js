// requires...
const express = require('express');
const connectDB = require('../db'); // import the db connection
const uploadFileContent = require('../utils/uploadFileContent');
const readJsonFile = require('../utils/readJsonFile');
const uploadToGoogleDrive = require('../utils/googleDriveUpload');
const runExtendScript = require('../extendScript');
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
const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.GOOGLE_API_KEY;


// Hardcoded user image path
const userImagePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.png');
const outputImagePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/photos/output/resized_user_photo.png');
// Write to tempData.json
const jsonFilePath = path.resolve('D:/Documents/GithubRepos/PosterAssistant/backend/output.json');


// Connect to the database before setting up routes
connectDB().then(() => {
  console.log('No errors with DB connection.');
}).catch((err) => {
  console.error("Failed to connect to DB:", err);
  process.exit(1); // Exit if DB connection fails
});

// Define routes
app.get('/api', (req, res) => {
  res.send('Hello from Express API!');
});

// If running locally, use app.listen
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}






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
  //   .replace(/```/g, "");;


  // // for returning a JS object
  // console.log(response);
  // return response;


  // ------------- uncomment FOR DUMMY DATA -------------------

  return carInfo = {
    make: 'Toyota',
    model: 'Celica',
    year: '2020',
    description: 'A reliable carrr'
  };
};


// Async function to handle resizing and then read the file, before sending it to Gemini API
async function processImage() {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputImagePath);
    await fsPromises.mkdir(outputDir, { recursive: true });

    // Resize the image and save it
    await sharp(userImagePath)
      .resize(800) // Resize to a width of 800px (maintaining aspect ratio)
      .toFile(outputImagePath);

    console.log("Image resized and saved to:", outputImagePath);

    // Read the resized image
    const imageBuffer = await fsPromises.readFile(outputImagePath);
    console.log("Resized image buffer ready for API request");

    // Call the getCarInfo function and wait for its result --- SENDS TO GEMINI
    const carInfo = await getCarInfo(imageBuffer);

    // Read and update the JSON file
    const jsonData = await fsPromises.readFile(jsonFilePath, "utf8");
    const tempJson = JSON.parse(jsonData);

    // Update vehicle and added fields
    tempJson.vehicle = {
      make: carInfo.make,
      model: carInfo.model,
      year: carInfo.year,
      description: carInfo.description,
    };

    // update pngs for make and model
    tempJson.added.makePng = carInfo.make.toLowerCase() + ".png";
    tempJson.added.modelPng = carInfo.model.toLowerCase() + ".png";

    // Write the updated JSON back to the file
    await fsPromises.writeFile(jsonFilePath, JSON.stringify(tempJson, null, 4));
    console.log("JSON file updated successfully with GEMINI data.");
  } catch (err) {
    console.error("Error during image processing:", err);
    throw err; // Rethrow the error to ensure the orchestrator is aware
  }
}


// populates local json file (for testing purposes only)
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
      name: "Preset_A_1_2.psd"
    },
    photo: {
      path: "D:/Documents/GithubRepos/PosterAssistant/photos/",
      name: "user_photo.png"
    },
    added: {
      path: "D:/Documents/PosterAssistantLocal/PNGS/",
      makePng: "",
      modelPng: "",
      add1: "enkei.png",
      add2: "bbs.png"
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


// Orchestrator function to enforce order
async function orchestrateFunctions() {
  try {
    console.log("Starting Poster Assistant Program...\n");
    await createJsonFile('../output.json'); // Then run the JSON creation function
    await populateJsonFile('../output.json'); // once networking is finished, edit this function to get json from mongo and update!
    await processImage(); // RUN function - processed by Gemini
    await validateOrExit('../output.json'); // exit program if json is not validated
    await runExtendScript();
    //await uploadToGoogleDrive(); // uploads output image to google drive
    //const fileId = await uploadFileContent('../output.json', 'output.json', 'application/json'); // upload to mongodb
    //await deleteJsonFile('../output.json');
    //await readJsonFile(fileId);
    await delay(3000);
    console.log("All tasks completed sequentially.");
  } catch (error) {
    console.error("An error occurred while executing Poster Assistant:", error);
    process.exit(1); // Exit with failure code
  }
}

// Start the sequence
orchestrateFunctions();


// Export the Express app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);
};
