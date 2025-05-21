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

const PSD = require('psd');
const psdPath = 'D:/Documents/GithubRepos/PosterAssistant/templates/Preset_simple_white.psd'; // TODO: Replace with the path to your PSD file


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


// Orchestrator function to enforce order
async function orchestrateAppFunctions() {
  try {
    console.log("Starting Poster Assistant Program (test mode)...\n");
    // Write testing code here
    //await extractAndCleanLayers(psdPath);
    //await getPsdInformation(psdPath);
    await getPSDInformationWithNodePackages(psdPath);

    console.log("All tasks completed sequentially.");
  } catch (error) {
    console.error("An error occurred while executing Poster Assistant:", error);
    process.exit(1); // Exit with failure code
  }
}

// Start the sequence (for testing only)
orchestrateAppFunctions();

async function clearTempFiles() {
  //await deleteJsonFile('../output.json'); // redundant
  //await fsPromises.unlink(resizedImagePath); // redundant
  //await fsPromises.unlink(userImagePath); // redundant
  await fsPromises.rm(folderOutputPath, { recursive: true, force: true });
  console.log("Output folder deleted successfully.");
}

// Extract all layer information and place in JSON file.
async function getPsdInformation(psdPath) {
  try {
    const psd = await PSD.open(psdPath);
    const tree = psd.tree().export();

    // Save JSON next to the PSD
    const outputPath = path.join(
      path.dirname(psdPath),
      path.basename(psdPath, '.psd') + '_layers.json'
    );

    fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2));
    console.log(`✅ Layers exported to ${outputPath}`);
  } catch (err) {
    console.error('❌ Error reading PSD file:', err);
  }
}

async function getPSDInformationWithNodePackages(psdPath) {
  var Parser = require('psd.js').Parser;

  var data = fs.readFileSync(psdPath);
  var psd = new Parser(data);

  psd.parse();

  console.log(psd);
}

// Extract only the important info and place in JSON file.
async function extractAndCleanLayers(psdPath) {
  try {
    const psd = await PSD.open(psdPath);
    const tree = psd.tree().export();

    const varTexts = tree.children.find(child => child.name === 'VAR_TEXTS');
    const varPngs = tree.children.find(child => child.name === 'VAR_PNGS');

    const varTextsLayers = varTexts?.children || [];
    const varPngsLayers = varPngs?.children || [];

    // Process all layers
    const cleanedLayers = [
      ...varTextsLayers.map(extractMinimalLayerInfo),
      ...varPngsLayers.map(extractMinimalLayerInfo)
    ];

    // Print it nicely
    console.log(JSON.stringify(cleanedLayers, null, 2));

    // Optional: Save to file
    const outputPath = path.join(
      path.dirname(psdPath),
      path.basename(psdPath, '.psd') + '_clean_layers.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(cleanedLayers, null, 2));
    console.log(`✅ Cleaned layers exported to ${outputPath}`);

  } catch (err) {
    console.error('❌ Error reading PSD file:', err);
  }
}

// --- Extract only the important info ---
function extractMinimalLayerInfo(layer) {
  const font = layer.text?.font || {};
  const transform = layer.text?.transform || {};

  return {
    name: layer.name,
    text: {
      value: layer.text?.value || '',
      fontName: font.names ? font.names[0] : '',
      fontSize: font.sizes ? font.sizes[0] : 0,
      fontColor: font.colors ? font.colors[0] : [0, 0, 0, 255],
      alignment: font.alignment ? font.alignment[0] : 'left'
    },
    position: {
      left: layer.left || 0,
      top: layer.top || 0,
      width: layer.width || 0,
      height: layer.height || 0
    },
    transform: {
      scaleX: transform.xx || 1,
      scaleY: transform.yy || 1,
      translateX: transform.tx || 0,
      translateY: transform.ty || 0
    },
    opacity: layer.opacity !== undefined ? parseFloat(layer.opacity.toFixed(4)) : 1
  };
}


// Export the Express app as a serverless function for Vercel
module.exports = (req, res) => {
  app(req, res);
};
