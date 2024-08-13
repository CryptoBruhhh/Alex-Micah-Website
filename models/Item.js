const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ticker: String,
    icon: String, // Path or URL to where the icon is stored
    banner: String, // Path or URL to where the banner is stored
    artwork: [String], // Array of paths or URLs
    countdown: { type: Number, required: true }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;