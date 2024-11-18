#target photoshop

try {
    // Define the path to the temporary JSON file (adjust path if needed)
    var jsonFilePath = new File("D:/Documents/GithubRepos/PosterAssistant/backend/tempData.json");

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

        // Replacing hardcoded paths with parsed JSON values
        var templateFile = File(templatePath); // Path to PSD file
        var imageFile = File(photoPath); // Path to the image you want to insert

        // Example usage in ExtendScript
        //alert("Make: " + make);
        //alert("Model: " + model);
        //alert("Year: " + year);
        //alert("Description: " + description);
        //alert("Template Path: " + templatePath);
        //alert("Photo Path: " + photoPath);

        // You can now proceed with operations using file and imageFile
        // Example:
        // app.open(templateFile);
        // app.open(imageFile);


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
    
        var makeImage = File("D:/Documents/GithubRepos/PosterAssistant/photos/make.png"); // Replace with actual image path
        var modelImage = File("D:/Documents/GithubRepos/PosterAssistant/photos/model.png"); // Replace with actual image path
        var extraImage1 = File("D:/Documents/GithubRepos/PosterAssistant/photos/extra1.png"); // Replace with actual image path
        var extraImage2 = File("D:/Documents/GithubRepos/PosterAssistant/photos/extra2.png"); // Replace with actual image path
    
    
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
    
        } catch (e) {
            alert("Error: Unable to place image in " + layerName + " layer: " + e.message);
        }
    }
    
    
    
    
    
    
    
        
        // Call function for each image
        placeImageInLayer(makeImage, "make");
        placeImageInLayer(modelImage, "model");
        placeImageInLayer(extraImage1, "extra1");
        placeImageInLayer(extraImage2, "extra2");
    
    
    
        // ----------------- END INSERT TEXT & PNG -----------------------
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
        // ---------------------- SAVE AS PNG ---------------------------
    
        // Step 5: Export the final project as a PNG
        
        if (1) {
        
            // Set up PNG export options
            var exportOptions = new ExportOptionsSaveForWeb();
            exportOptions.format = SaveDocumentType.PNG;
            exportOptions.transparency = true; // Maintain transparency if necessary
            exportOptions.quality = 100;
    
            // Define the export file location
            var exportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/ExportedImage.png"); // Set the desired export path
    
            // Export the document as PNG
            doc.exportDocument(exportFile, ExportType.SAVEFORWEB, exportOptions);    
            
        }
        
        // ---------------------- END SAVE AS PNG ---------------------------
    
    
    
    
    
    
        
        // ---------------------- EXIT---------------------------
        
        if (1) {
            
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

// Close the ExtendScript Toolkit window
app.quit();