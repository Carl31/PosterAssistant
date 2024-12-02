const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    path: String, // If storing metadata
    data: Buffer, // If storing file content
    type: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
