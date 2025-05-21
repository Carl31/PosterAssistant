// Test script to show all layers of .psd file (needs photoshop to be running):

var doc = app.activeDocument;
var layersData = [];

// for formatting
function parseLayer(layer) {
    var info = {
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        bounds: {
            left: layer.bounds[0].as("px"),
            top: layer.bounds[1].as("px"),
            right: layer.bounds[2].as("px"),
            bottom: layer.bounds[3].as("px"),
        },
        type: layer.kind.toString()
    };
    if (layer.kind == LayerKind.TEXT) {
        info.text = layer.textItem.contents;
    }
    layersData.push(info);
}

// Flatten the layer structure (including groups)
function parseLayers(layers) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (layer.typename == "ArtLayer") {
            parseLayer(layer);
        } else if (layer.typename == "LayerSet") {
            parseLayers(layer.layers);
        }
    }
}

// funciton execution:
parseLayers(doc.layers);

// Saves psd information to json file:
var json = JSON.stringify(layersData, null, 2);

// Save JSON to desktop
var file = new File(Folder.desktop + "/layers.json");
file.open("w");
file.write(json);
file.close();
alert("Exported layers to layers.json!");
