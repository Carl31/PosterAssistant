// Purpose of this script:
// Places user image at bottom-most layer then calls my pre-recorded action to move place the image perfectly in the mockup. Export as png, exit witout saving.

#target photoshop

try {
    // IMPORTANT: set these two variables:
    //var templateFileName = "Poster_Assistant_MOCKUP_1";
    //var userPhotoPath = "D:/Documents/GithubRepos/PosterAssistant/photos/user_photo.png";

    var mockupPath = "D:/Documents/GithubRepos/PosterAssistant/templates/" + templateFileName + ".psd";
    var mockupExportFile = new File("D:/Documents/GithubRepos/PosterAssistant/photos/output/ExportedMockupImage3D.png"); // Set the desired export path


    // ---------------------- START MOCKUP GENERATOR ----------------------------

    // Open the PSD file
    var templateFile = File(mockupPath);
    if (!templateFile.exists) throw new Error("Template PSD file not found.");
    var doc = app.open(templateFile);

    var imageFile = File(userPhotoPath);


    try {
        //alert  ("Starting mockup generation...");
        var doc = app.activeDocument; // Reference the active document
        var bottomLayer = doc.layers[doc.layers.length - 1]; // Get the bottom-most layer

        // Open the image to insert
        var importedImage = app.open(imageFile);
        importedImage.selection.selectAll();
        importedImage.selection.copy(); // Copy image contents
        importedImage.close(SaveOptions.DONOTSAVECHANGES); // Close without saving

        // Set active document back to the PSD
        app.activeDocument = doc;
        doc.paste(); // Paste image into the PSD

        var pastedLayer = doc.activeLayer; // Reference the newly pasted layer
        pastedLayer.move(bottomLayer, ElementPlacement.PLACEAFTER); // Move pasted layer above the bottom layer

        // Optionally, rename the pasted layer
        pastedLayer.name = "Imported Image";

        app.doAction(templateFileName, "PosterAssistant"); // Runs the action with the specified name and set

        //alert("Image placed above the bottom-most layer successfully!");
    } catch (e) {
        alert("Error: " + e.message);
    }



    if (1) {

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


    // ---------------------- START EXIT NOTIFICATION --------------------------
    if (0) {
        var file = new File("D:/Documents/GithubRepos/PosterAssistant/backend/done.txt"); // Replace with your file path
        file.open("w");
        file.write("JSX script \"updateTemplateWithVariables.jsx\" completed!");
        file.close();
    }
    // ---------------------- END EXIT NOTIFICATION --------------------------




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