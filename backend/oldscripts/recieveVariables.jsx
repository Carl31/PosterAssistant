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
        var make = data.text.make || "Unknown Make";
        var model = data.text.model || "Unknown Model";
        var year = data.text.year || "Unknown Year";
        var description = data.text.description || "No Description";
        var templatePath = data.template.path + data.template.name;
        var photoPath = data.photo.path + data.photo.name;

        // Replacing hardcoded paths with parsed JSON values
        var templateFile = File(templatePath); // Path to PSD file
        var imageFile = File(photoPath); // Path to the image you want to insert

        // Example usage in ExtendScript
        alert("Make: " + make);
        alert("Model: " + model);
        alert("Year: " + year);
        alert("Description: " + description);
        alert("Template Path: " + templatePath);
        alert("Photo Path: " + photoPath);

        // You can now proceed with operations using file and imageFile
        // Example:
        // app.open(templateFile);
        // app.open(imageFile);

    } else {
        throw new Error("Failed to open JSON file at path: " + jsonFilePath.fsName);
    }
} catch (error) {
    alert("Error: " + error.message);
}
