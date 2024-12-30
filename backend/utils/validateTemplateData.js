// Function to validate (i.e. see if files are present on local drive) all the png files referenced in json.
// Note: if just one single extra png file cannot be found, then no extra pngs will be used in the jsx script.
// Takes json file path

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
    

      // validates pngs:
      const { makePngValid, modelPngValid, extraPngsValid } = await validatePngFiles(data);

      data.flags = {
        addMakePng: makePngValid ? 1 : 0,
        addModelPng: modelPngValid ? 1 : 0,
        addExtraPngs: extraPngsValid ? 1 : 0,
      };
      
      // ------------ Adds boolean from template name into json doc:

      // Write the updated JSON back to the file
      await fsPromises.writeFile(filePath, JSON.stringify(data, null, 4));
      //console.log("Updated JSON file with validation results.");
      
      // ------------ Finsh adding boolean
      
      
      // DONE: Needs to update data.flags with addModelPng and addMakePng from validation checks within this function, THEN ensure that the jsx script uses these to determine whether to add them in or not.
      // FIXME: 
      // Check if the adobe action function works - where it only does action if its available. I think my fundAction function is broken - test with the "t" action.
      // THEN: Start start networking!!!
  
      // Output results
      console.log(`\nTemplate INFO:`);
      console.log(`Name: ${templateName}`);
  
      const pngsValid = makePngValid && modelPngValid && extraPngsValid;
      console.log(`JSON Validation Results:`);
      console.log(`Model PNG Valid/Useable: ${modelPngValid}`);
      console.log(`Make PNG Valid/Useable: ${makePngValid}`);
      console.log(`Extra PNGs Valid/Useable: ${extraPngsValid}`); // Note: says invlid if there are no extra pngs
    
      // Return true only if all checks pass
      return pngsValid;
  
    } catch (error) {
      console.error("JSON Validation error:", error.message);
      return false;
    }
}

// Checks that required make, model and extra brand pngs are available as local files.
async function validatePngFiles(data) {
  // Validate make.png
  const makePngPath = path.join(
    "D:/Documents/PosterAssistantLocal/PNGS/Makes",
    data.added.makePng
  );
  const makePngValid = await fsPromises
    .access(makePngPath)
    .then(() => true)
    .catch(() => false);

  // Validate model.png
  const modelPngPath = path.join(
    "D:/Documents/PosterAssistantLocal/PNGS/Models",
    data.added.modelPng
  );
  const modelPngValid = await fsPromises
          .access(modelPngPath)
          .then(() => true)
          .catch(() => false);

  // Validate additional PNGs
  let addIndex = 1;
  let extraPngsValid = true;

  while (true) {
    const addKey = `add${addIndex}`;
    const addPng = data.added[addKey];

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
      extraPngsValid = false;
      break;
    }

    addIndex++;
  }

  return { makePngValid, modelPngValid, extraPngsValid };
}


// Wrapper function or validation
async function validateOrExit(filePath) {
  console.log("Starting JSON validation...")
  const isValid = await validateTemplateData(filePath);
  if (!isValid) {
    //console.error("Validation failed. Exiting program.");
    //process.exit(1); // Terminate the program with an error code
    console.log("Validation finished: warning, some pngs not usable.");
  }
  console.log("Validation finshed: all pngs usable.\n");
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
