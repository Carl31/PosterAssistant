// Purpose of this script:
// Places user image perfectly in the mockup (within the "frame" layer). Export as png, exit witout saving.

#target photoshop

try {
    // IMPORTANT: set these two variables:
    //var templateFileName = "Poster_Assistant_MOCKUP_1";
    //var userPhotoPath = "D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.png";

    var mockupPath = "D:/Documents/GithubRepos/PosterAssistant/templates/" + mockupTemplateFileName + ".psd";
    var mockupExportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/output/" + mockupTemplateFileName + ".png"); // Set the desired export path
    var posterExportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedPoster.png"); // used for user image


    // ---------------------- START MOCKUP GENERATOR ----------------------------

    try {
        // Open the PSD file
        var templateFile = File(mockupPath);
        if (!templateFile.exists) throw new Error("Template PSD file not found.");
        var doc = app.open(templateFile);

        // Step 1: Insert user image on top of Layer 0 and resize

        placeImageInLayer(posterExportFile, "frame");


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




    if (1) { // save and exit file.

        // Set up PNG export options
        var exportOptions = new ExportOptionsSaveForWeb();
        exportOptions.format = SaveDocumentType.PNG;
        exportOptions.transparency = true; // Maintain transparency if necessary
        exportOptions.quality = 100;

        // Export the document as PNG
        doc.exportDocument(mockupExportFile, ExportType.SAVEFORWEB, exportOptions);

        // Close document
        // Ensure no save prompt by marking the document as unmodified
        doc.dirty = false;

        // Close the document without saving
        doc.close(SaveOptions.DONOTSAVECHANGES);

    }

    // ---------------------- END SAVE MOCKUP AS PNG ---------------------------



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

    //alert("User image inserted and resized successfully!");
} catch (error) {
    alert("Error with mockup genration: " + error.message);
}