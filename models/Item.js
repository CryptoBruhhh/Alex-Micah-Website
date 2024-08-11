const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    banner: { type: String, required: true },
    artwork: [String], // Array of image URLs
    countdown: { type: Number, required: true }
});

module.exports = mongoose.model('Item', itemSchema);
