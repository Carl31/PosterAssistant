// Function to validate json data based on template name. (See inside /templates folder for naming conventions)
// takes json file path

const fs = require("fs"); // Import file system module
const fsPromises = require("fs/promises");
const path = require("path"); // To handle file paths


// Validates template name
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

      // ------------ Adds boolean from template name into json doc:

      data.flags = {
        addModelPng: firstNum,
      };
      
      // Write the updated JSON back to the file
      await fsPromises.writeFile(filePath, JSON.stringify(data, null, 4));
      //console.log("Inserted boolean into JSON file.");
      
      // ------------ Finsh adding boolean

      
      // validates pngs:
      const pngsValid = await validatePngFiles(data);
  
      // Output results
      console.log(`\nTemplate INFO:`);
      console.log(`Version: ${letter}`);
      console.log(`Needs model png: ${firstNum == 1 ? true : false}`);
      console.log(`Number of extra brands: ${secondNum}`);
      console.log(`JSON Validation Results:`);
      console.log(`Model PNG Count Valid: ${modelPngCountValid}`);
      console.log(`Extra PNGs Count Valid: ${extraPngsCountValid}`);
      console.log(`All PNGs Valid: ${pngsValid}`);
    
      // Return true only if all checks pass
      return modelPngCountValid && extraPngsCountValid && pngsValid;
  
    } catch (error) {
      console.error("JSON Validation error:", error.message);
      return false;
    }
}

// Checks that required make, model and extra brand pngs are available as local files.
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

    // Check if make.png and model.png exist

    const [makeExists, modelExists] = await Promise.all([
      fsPromises.access(makePngPath).then(() => true).catch(() => false),
      fsPromises.access(modelPngPath).then(() => true).catch(() => false),
    ]);

    if (!makeExists) {
      throw new Error(`Make PNG not found at ${makePngPath}`);
    }
    if (!modelExists && data.flags.addModelPng == 1) {
      throw new Error(`Model PNG not found at ${modelPngPath}`);
    }

    console.log("Make and model PNGs are valid.");

    // Validate additional PNGs (add1, add2, add3, etc.)
    let addIndex = 1; // Start from add1
    while (true) {
      const addKey = `add${addIndex}`;
      const addPng = data.added[addKey];

      // Stop if there is no addX key
      if (!addPng) break;

      const addPngPath = path.join(
        "D:/Documents/PosterAssistantLocal/PNGS/Extras",
        addPng
      );

      const addExists = await fsPromises
        .access(addPngPath)
        .then(() => true)
        .catch(() => false);

      if (!addExists) {
        throw new Error(`Additional PNG not found at ${addPngPath}`);
      }

      console.log(`Additional PNG ${addKey} is valid.`);
      addIndex++; // Check the next addX key
    }

    return true; // All validations passed
  } catch (err) {
    console.error("An error occurred during PNG validation:", err.message);
    return false;
  }
}


// Wrapper function or validation
async function validateOrExit(filePath) {
  console.log("Starting JSON validation...")
  const isValid = await validateTemplateData(filePath);
  if (!isValid) {
    console.error("Validation failed. Exiting program.");
    process.exit(1); // Terminate the program with an error code
  }
  console.log("Validation passed.\n");
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
