// Purpose of this script:
// 1) Places user photo
// 2) Inserts car info texr
// 3) Places additional pngs (if any) - note, this part probably causes errors - havent tested edge cases yet
// 4) Applys styles to layers
// 5) Saves output as PNG 
// 6) Runs generation for mockup - exports as png
// Closes photoshop 

#target photoshop

try {

    // Define the path to the temporary JSON file (adjust path if needed)
    var jsonFilePath = new File("D:/Documents/GithubRepos/PosterAssistant/backend/output.json");
    var mockupPath = "D:/Documents/GithubRepos/PosterAssistant/templates/Poster_Assistant_MOCKUP.psd";
    var mockupPhotoPath = "D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.png";
    var posterExportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedPoster.png"); // Set the desired export path (used for mockup input too) - NEED TO SET THIS FROM JSON FILE
    var mockupExportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedMockupImage.png"); // Set the desired export path - NEED TO SET THIS FROM JSON FILE


    // Check if the file exists
    if (!jsonFilePath.exists) {
        throw new Error("JSON file not found at path: " + jsonFilePath.fsName);
    }

    // Open and read the JSON file
    if (jsonFilePath.open("r")) {
        
        var jsonData = jsonFilePath.read();
        jsonFilePath.close();

        // Parse JSON data with error handling
        var data;
        try {
            data = eval('(' + jsonData + ')'); // Using eval as JSON.parse is not available in ExtendScript
        } catch (e) {
            throw new Error("Failed to parse JSON data: " + e.message);
        }

        // Access data fields safely
        var make = data.vehicle.make || "Unknown Make";
        var model = data.vehicle.model || "Unknown Model";
        var year = data.vehicle.year || "Unknown Year";
        var description = data.vehicle.description || "No Description";
        var templatePath = data.template.path + data.template.name;
        var photoPath = data.photo.path + data.photo.name;
        var addModelPngFlag = data.flags.addModelPng;

        // Replacing hardcoded paths with parsed JSON values
        var templateFile = File(templatePath); // Path to PSD file
        var imageFile = File(photoPath); // Path to the image you want to insert

        // Example usage
        //alert("Make: " + make);
        //alert("Model: " + model);
        //alert("Year: " + year);
        //alert("Description: " + description);
        //alert("Template Path: " + templatePath);
        //alert("Photo Path: " + photoPath);




        // Ensure Photoshop is running and open the PSD file
        var file = File(templatePath); // Path to PSD file from JSON data
        var doc = app.open(file); // Open the PSD file in Photoshop


        // STEP 1 : Insert user image on top of Layer 0 and resize
        // Insert an image layer on top of the bottom-most layer


        // Path to the image file from JSON data
        var imageFile = File(photoPath);


        if (imageFile.exists) {
            var bottomLayer = doc.layers[doc.layers.length - 1]; // Select the bottom-most layer
            var importedImage = app.open(imageFile); // Open the image to insert
            importedImage.selection.selectAll();
            importedImage.selection.copy(); // Copy image contents
            importedImage.close(SaveOptions.DONOTSAVECHANGES);

            app.activeDocument = doc; // Set active document back to PSD
            doc.paste(); // Paste image onto PSD



            // -------------- FOR RESIZING IMAGE -----------------

            // Find the dimensions of the bottom-most layer
            var bottomLayerBounds = bottomLayer.bounds;
            var bottomLayerWidth = bottomLayerBounds[2] - bottomLayerBounds[0];
            var bottomLayerHeight = bottomLayerBounds[3] - bottomLayerBounds[1];

            // Calculate the scale needed to cover the bottom-most layer while preserving the aspect ratio
            var pastedLayer = doc.activeLayer;
            var pastedWidth = pastedLayer.bounds[2] - pastedLayer.bounds[0];
            var pastedHeight = pastedLayer.bounds[3] - pastedLayer.bounds[1];

            var scaleFactorWidth = bottomLayerWidth / pastedWidth;
            var scaleFactorHeight = bottomLayerHeight / pastedHeight;
            var scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight); // Choose the larger factor to cover the layer

            // Scale the pasted image
            pastedLayer.resize(scaleFactor * 100, scaleFactor * 100, AnchorPosition.MIDDLECENTER);

            // Center the image on the bottom layer
            pastedLayer.translate(
                (bottomLayerBounds[0] + bottomLayerBounds[2] - pastedLayer.bounds[0] - pastedLayer.bounds[2]) / 2,
                (bottomLayerBounds[1] + bottomLayerBounds[3] - pastedLayer.bounds[1] - pastedLayer.bounds[3]) / 2
            );

            //---------- END RESIZING ---------------


            var pastedLayer = doc.activeLayer;
            pastedLayer.move(bottomLayer, ElementPlacement.PLACEBEFORE); // Move pasted layer above the bottom layer
        }






        // ----------------- INSERT TEXT & PNG -----------------------



        // Step 2: Define image variables

        // Access the "added" part of the JSON
        var added = data.added;
        var addedPath = data.added.path;

        // Initialize variables to store PNG paths (only for make and model pngs)
        var makeImage = File(addedPath + "Makes/" + added.makePng) || null;
        var modelImage = File(addedPath + "Models/" + added.modelPng) || null;

        // Obselete
        //var makeImage = File("D:/Documents/GithubRepos/PosterAssistant/photos/make.png"); // Replace with actual image path
        //var modelImage = File("D:/Documents/GithubRepos/PosterAssistant/photos/model.png"); // Replace with actual image path
        //var extraImage1 = File("D:/Documents/GithubRepos/PosterAssistant/photos/extra1.png"); // Replace with actual image path
        //var extraImage2 = File("D:/Documents/GithubRepos/PosterAssistant/photos/extra2.png"); // Replace with actual image path


        // Step 3: Insert text into respective layers in VAR_TEXTS folder
        var varTextsFolder = doc.layerSets.getByName("VAR_TEXTS");

        try {
            varTextsFolder.artLayers.getByName("make").textItem.contents = make;
            varTextsFolder.artLayers.getByName("model").textItem.contents = model;
            varTextsFolder.artLayers.getByName("year").textItem.contents = year;
            varTextsFolder.artLayers.getByName("description").textItem.contents = description;
        } catch (e) {
            alert("Error: Unable to find text layers in VAR_TEXTS folder. Check layer names.");
        }


        // Step 4: Insert images into respective layers in VAR_PNGS folder
        var varPngsFolder = doc.layerSets.getByName("VAR_PNGS");  // Access folder by name
        varPngsFolder.selected = true;  // Ensure the folder is selected


        doc.selection.deselect();

        // Helper function for placing an image in a layer (specific to VARPNGS folder)
        function placeImageInLayer(imageFile, layerName) {
            try {
                var varPngsFolder = doc.layerSets.getByName("VAR_PNGS"); // Access folder
                doc.activeLayer = varPngsFolder;  // Set the folder as active layer
                var targetLayer = varPngsFolder.artLayers.getByName(layerName); // Get target layer by name
                var targetBounds = targetLayer.bounds; // Get target layer bounds

                // Remove the existing layer (if any)
                targetLayer.remove();

                // Open and paste the new image
                var placedImage = app.open(imageFile);
                placedImage.selection.selectAll();
                placedImage.selection.copy(); // Copy the image
                placedImage.close(SaveOptions.DONOTSAVECHANGES); // Close without saving

                doc.paste(); // Paste the image

                var pastedLayer = doc.activeLayer; // Get the pasted layer

                // Resize the pasted layer to fit the target layer's bounds
                var pastedWidth = pastedLayer.bounds[2] - pastedLayer.bounds[0];
                var pastedHeight = pastedLayer.bounds[3] - pastedLayer.bounds[1];

                var scaleFactorWidth = (targetBounds[2] - targetBounds[0]) / pastedWidth;
                var scaleFactorHeight = (targetBounds[3] - targetBounds[1]) / pastedHeight;
                var scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight); // Maintain aspect ratio

                pastedLayer.resize(scaleFactor * 100, scaleFactor * 100, AnchorPosition.MIDDLECENTER); // Resize the image

                // Center the image within the target layer's bounds
                pastedLayer.translate(
                    (targetBounds[0] + targetBounds[2] - pastedLayer.bounds[0] - pastedLayer.bounds[2]) / 2,
                    (targetBounds[1] + targetBounds[3] - pastedLayer.bounds[1] - pastedLayer.bounds[3]) / 2
                );

                // Move the pasted image into the correct folder
                varPngsFolder.artLayers.add(pastedLayer); // Add to the folder
                pastedLayer.name = layerName; // Rename the layer after adding it to the folder

            } catch (e) {
                alert("Error: Unable to place image in " + layerName + " layer: " + e.message);
            }
        }




        // CALLING ABOVE FUNCTION FOR EACH LAYER (inserts each png which is found within the "added" value of JSON file) -----------------

        // 1) For make and model

        placeImageInLayer(makeImage, "make");
        if (addModelPngFlag == 1) { placeImageInLayer(modelImage, "model"); }



        // 2) For extras
        // Loop through keys in the "added" object, add all extra pngs (string names) to the array
        var addPngs = [];
        for (var key in added) {
            // checks if the key starts with "add" and the value is not empty
            if (key.indexOf("add") === 0 && added[key] !== "") {
                addPngs.push(added[key]);
            }
        }

        // Loop through all addPngs
        // Places all additional layers in "extraX" layers. Alerts if there are more pngs in json than available "extraX" layer within the template.
        for (var i = 0; i < addPngs.length; i++) {
            var extraLayer = "extra" + (i + 1); // Example: extra1, extra2, extra3
            var imageFile = new File(addedPath + "Extras/" + addPngs[i]);

            // Check if the extra[i] layer exists
            try {
                var targetLayer = doc.layerSets.getByName("VAR_PNGS").artLayers.getByName(extraLayer);
                targetLayer.visible = true;

                // If the layer exists, call placeImageInLayer
                placeImageInLayer(imageFile, extraLayer);

            } catch (e) {
                alert("No such layer: " + extraLayer);
                break; // Stop the loop if the layer doesn't exist
            }
        }

        // END CALLING FUNCTION OF EACH LAYER -----------------------


        // ----------------- END INSERT TEXT & PNG -----------------------





        // ----------------- START APPLYING STLES TO LAYERS -----------------------

        //  applying colour overlay style
        function applyPredefinedStyle(layerName, styleName, parentFolder) {
            // Get the layer by name
            var layer = findLayerByName(app.activeDocument, layerName, parentFolder);
            if (!layer) {
                alert("Layer not found: " + layerName);
                return;
            }

            // Activate the layer
            app.activeDocument.activeLayer = layer;

            // Apply the saved layer style
            try {
                layer.applyStyle(styleName); // Apply the style by name
            } catch (e) {
                alert("Layer style not found: " + styleName);
            }
        }

        // Recursive function to find a layer by name within a parent folder or globally
        function findLayerByName(parentLayerSet, name, parentFolder) {
            if (parentFolder) {
                // Search only within the specified parent folder
                for (var k = 0; k < parentLayerSet.layerSets.length; k++) {
                    if (parentLayerSet.layerSets[k].name === parentFolder) {
                        // If folder matches, search only within it
                        return findLayerByName(parentLayerSet.layerSets[k], name);
                    }
                }
                return null; // Folder not found or no matching layer within it
            } else {
                // Search globally (default behavior)
                for (var i = 0; i < parentLayerSet.artLayers.length; i++) {
                    if (parentLayerSet.artLayers[i].name === name) {
                        return parentLayerSet.artLayers[i];
                    }
                }

                for (var j = 0; j < parentLayerSet.layerSets.length; j++) {
                    var result = findLayerByName(parentLayerSet.layerSets[j], name);
                    if (result) {
                        return result;
                    }
                }

                return null; // Return null if layer not found
            }
        }

        // Example Usage
        applyPredefinedStyle("make", "WhiteOverlay", "VAR_PNGS"); // Apply "White Overlay" style to "MyPastedLayer"

        // ----------------- END APPLYING STLES TO LAYERS -----------------------









        // ---------------------- SAVE AS PNG ---------------------------

        // Step 5: Export the final project as a PNG

        if (1) {

            // Set up PNG export options
            var exportOptions = new ExportOptionsSaveForWeb();
            exportOptions.format = SaveDocumentType.PNG;
            exportOptions.transparency = true; // Maintain transparency if necessary
            exportOptions.quality = 100;

            // Define the export file location - moved file header


            // Export the document as PNG
            doc.exportDocument(posterExportFile, ExportType.SAVEFORWEB, exportOptions);

        }

        // ---------------------- END SAVE AS PNG ---------------------------




        // ---------------------- START MOCKUP GENERATOR ----------------------------

        //var mockupFile = File(mockupPath);
        //if (!mockupFile.exists) throw new Error("Template PSD file not found.");
        //var doc = app.open(mockupFile);

        try {
            // Open the PSD file
            var templateFile = File(mockupPath);
            if (!templateFile.exists) throw new Error("Template PSD file not found.");
            var doc = app.open(templateFile);

            //var imageFile = File(mockupPhotoPath);
            //if (!imageFile.exists) throw new Error("User image file not found.");


            // Step 1: Insert user image on top of Layer 0 and resize

            placeImageInLayer(posterExportFile, "frame");



            // ---------------------- SAVE MOCKUP AS PNG ---------------------------

            // Step 2: Export the final project as a PNG

            if (1) {

                // Set up PNG export options
                var exportOptions = new ExportOptionsSaveForWeb();
                exportOptions.format = SaveDocumentType.PNG;
                exportOptions.transparency = true; // Maintain transparency if necessary
                exportOptions.quality = 100;

                // Export the document as PNG
                doc.exportDocument(mockupExportFile, ExportType.SAVEFORWEB, exportOptions);

            }

            // ---------------------- END SAVE MOCKUP AS PNG ---------------------------





            /// Helper function for placing an image in a layer - also selects the correct coordinates and applies mask
            function placeImageInLayer(imageFile, layerName) {
                try {
                    var doc = app.activeDocument; // Reference to the active document
                    var targetLayer = findLayerByName(doc, layerName); // Get target layer by name
                    var targetBounds = targetLayer.bounds; // Get target layer bounds

                    // Convert bounds to pixels (if not already in pixels)
                    var x1 = targetBounds[0].as("px");
                    var y1 = targetBounds[1].as("px");
                    var x2 = targetBounds[2].as("px");
                    var y2 = targetBounds[3].as("px");

                    // Debug: Log the converted bounds
                    //alert("Converted bounds (pixels): " + x1 + ", " + y1 + ", " + x2 + ", " + y2);

                    // Remove the existing layer (if any)
                    targetLayer.remove();

                    // Open and paste the new image
                    var placedImage = app.open(imageFile);
                    placedImage.selection.selectAll();
                    placedImage.selection.copy(); // Copy the image
                    placedImage.close(SaveOptions.DONOTSAVECHANGES); // Close without saving

                    doc.paste(); // Paste the image

                    var pastedLayer = doc.activeLayer; // Get the pasted layer

                    // Resize the pasted layer to fit the target layer's bounds
                    var pastedWidth = pastedLayer.bounds[2] - pastedLayer.bounds[0];
                    var pastedHeight = pastedLayer.bounds[3] - pastedLayer.bounds[1];

                    var scaleFactorWidth = (targetBounds[2] - targetBounds[0]) / pastedWidth;
                    var scaleFactorHeight = (targetBounds[3] - targetBounds[1]) / pastedHeight;
                    var scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight); // Maintain aspect ratio

                    pastedLayer.resize(scaleFactor * 100, scaleFactor * 100, AnchorPosition.MIDDLECENTER); // Resize the image

                    // Center the image within the target layer's bounds
                    pastedLayer.translate(
                        (targetBounds[0] + targetBounds[2] - pastedLayer.bounds[0] - pastedLayer.bounds[2]) / 2,
                        (targetBounds[1] + targetBounds[3] - pastedLayer.bounds[1] - pastedLayer.bounds[3]) / 2
                    );

                    // Rename the layer after adding it to the folder
                    pastedLayer.name = layerName;

                    // for testing - alert(doc.activeLayer);

                    // Select the area based on the adjusted bounds
                    doc.selection.select([
                        [x1, y1], // Top-left corner
                        [x2, y1], // Top-right corner
                        [x2, y2], // Bottom-right corner
                        [x1, y2]  // Bottom-left corner
                    ]);

                    // Apply the mask
                    addLayerMask();




                } catch (e) {
                    alert("Error: Unable to place image in " + layerName + " layer: " + e.message);
                }
            }


            // Function to add a layer mask revealing the current selection (uses Extendscript's action manager)
            function addLayerMask() {
                var idMk = charIDToTypeID("Mk  ");
                var desc = new ActionDescriptor();
                var idNw = charIDToTypeID("Nw  ");
                var idChnl = charIDToTypeID("Chnl");
                desc.putClass(idNw, idChnl);
                var idAt = charIDToTypeID("At  ");
                var ref = new ActionReference();
                var idChnl2 = charIDToTypeID("Chnl");
                var idMsk = charIDToTypeID("Msk ");
                ref.putEnumerated(idChnl2, idChnl2, idMsk);
                desc.putReference(idAt, ref);
                var idUsng = charIDToTypeID("Usng");
                var idUsrM = charIDToTypeID("UsrM");
                var idRvlS = charIDToTypeID("RvlS");
                desc.putEnumerated(idUsng, idUsrM, idRvlS);
                executeAction(idMk, desc, DialogModes.NO);
            }

            //alert("User image inserted and resized successfully!");
        } catch (error) {
            alert("Error with mockup genration: " + error.message);
        }


        // ---------------------- END MOCKUP GENERATOR ----------------------------





        // ---------------------- SECONDARY SCRIPT(s) ---------------------------

        if (1) {
            try {
                //alert("Starting secondary script...");
                var templateFileName = "Poster_Assistant_MOCKUP_1";
                var userPhotoPath = "D:/Documents/GithubRepos/PosterAssistant/photos/output/ExpotedPoster.png";
                // Provide the full path to the secondary script file
                var secondaryScriptPath = "D:/Documents/GithubRepos/PosterAssistant/backend/createMockup.jsx";
                $.evalFile(secondaryScriptPath); // Executes the secondary script
                //alert("Secondary script executed successfully!");
            } catch (e) {
                alert("Error: " + e.message);
            }
        }

        // ---------------------- END SECONDARY SCRIPT(s) ---------------------------






        // ---------------------- NOTIFICATION ---------------------------

        if (0) {
            // Creates a text document to notify nodejs when completed this script
            var file = new File("D:/Documents/GithubRepos/PosterAssistant/backend/done.txt"); // Replace with your file path
            file.open("w");
            file.write("JSX script \"updateTemplateWithVariables.jsx\" completed!");
            file.close();
        }



        // ---------------------- END NOTIFICATION ---------------------------



        // ---------------------- EXIT---------------------------

        if (0) {

            // Ensure no save prompt by marking the document as unmodified
            doc.dirty = false;

            // Close the document without saving
            doc.close(SaveOptions.DONOTSAVECHANGES);

            // Close Photoshop
            app.system("taskkill /IM Photoshop.exe /F"); // For Windows

        }

        // ---------------------- END EXIT---------------------------

    } else {
        throw new Error("Failed to open JSON file at path: " + jsonFilePath.fsName);
    }
} catch (error) {
    alert("Error: " + error.message);
}

// Close the ExtendScript Toolkit window - does not work
//$.sleep(2000);
//app.quit();