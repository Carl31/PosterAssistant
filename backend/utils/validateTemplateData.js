// Function to validate json data based on template name. (See inside /templates folder for naming conventions)
// takes json file path

const fs = require("fs"); // Import file system module
const fsPromises = require("fs/promises");
const path = require("path"); // To handle file paths

async function validateTemplateData(filePath) {
    try {
      // Read and parse the JSON file from the provided path
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);
  
      // Extract template name
      const templateName = data.template.name;
  
      // Extract the letter, first number, and second number using regex
      const matches = templateName.match(/([A-Z])_(\d)_(\d)/);
  
      if (!matches) {
        console.error("Template name format is invalid");
        return false;
      }
  
      const [_, letter, firstNumber, secondNumber] = matches; // Destructure regex matches
  
      // Convert numbers to integers for comparison
      const firstNum = parseInt(firstNumber, 10);
      const secondNum = parseInt(secondNumber, 10);
  
      // Perform the checks
      const modelPngCountValid = firstNum === 1 ? typeof data.added.modelPng === "string" && data.added.modelPng.trim() !== "" : true;
      const extraPngs = Object.keys(data.added).filter(key => key.startsWith("add") && data.added[key].trim() !== "");
      const extraPngsCountValid = secondNum === extraPngs.length;

      // validates pngs:
      const pngsValid = await validatePngFiles(data);
  
      // Output results
      console.log(`\nTemplate INFO:`);
      console.log(`Letter: ${letter}`);
      console.log(`First Number: ${firstNum}`);
      console.log(`Second Number: ${secondNum}`);
      console.log(`JSON Validation Results:`);
      console.log(`Model PNG Count Valid: ${modelPngCountValid}`);
      console.log(`Extra PNGs Count Valid: ${extraPngsCountValid}`);
      console.log(`Make+Model PNGs Valid: ${pngsValid}`);
      console.log("\n");
  
      // Return true only if all checks pass
      return modelPngCountValid && extraPngsCountValid && pngsValid;
  
    } catch (error) {
      console.error("Error reading or parsing the file:", error.message);
      return false;
    }
}


async function validatePngFiles(data) {
  try {
    // Construct paths to make.png and model.png
    const makePngPath = path.join(
      "D:/Documents/PosterAssistantLocal/PNGS/Makes",
      data.added.makePng
    );
    const modelPngPath = path.join(
      "D:/Documents/PosterAssistantLocal/PNGS/Models",
      data.added.modelPng
    );

    // Check if both files exist
    const [makeExists, modelExists] = await Promise.all([
      fsPromises.access(makePngPath).then(() => true).catch(() => false),
      fsPromises.access(modelPngPath).then(() => true).catch(() => false),
    ]);

    if (!makeExists) {
      throw new Error(`Make PNG not found at ${makePngPath}`);
    }
    if (!modelExists) {
      throw new Error(`Model PNG not found at ${modelPngPath}`);
    }

    console.log("Both make and model PNGs are valid.");
    return true;
  } catch (err) {
    console.error("An error occurred during PNG validation:", err.message);
    return false;
  }
}

async function validateOrExit(filePath) {
  const isValid = await validateTemplateData(filePath);
  if (!isValid) {
    console.error("Validation failed. Exiting program.");
    process.exit(1); // Terminate the program with an error code
  }
  console.log("Validation passed.");
}
  
  

module.exports = { validateTemplateData, validateOrExit };


// Example Usage
//   const updatedData = {
//     vehicle: {
//       make: "",
//       model: "",
//       year: "",
//       description: ""
//     },
//     template: {
//       path: "D:/Documents/GithubRepos/PosterAssistant/templates/",
//       name: "Preset_A_1_2.psd"
//     },
//     photo: {
//       path: "D:/Documents/GithubRepos/PosterAssistant/photos/",
//       name: "user_photo.png"
//     },
//     added: {
//       path: "D:/Documents/GithubRepos/PosterAssistant/photos/",
//       makePng: "make.png",
//       modelPng: "model.png",
//       add1: "extra1.png",
//       add2: "extra2.png"
//     }
//   };
  
  //console.log(validateTemplateData(updatedData));
