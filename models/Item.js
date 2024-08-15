const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ticker: { type: String, required: true, unique: true },
    icon: String, // Path or URL to where the icon is stored
    banner: String, // Path or URL to where the banner is stored
    artwork: [String], // Array of paths or URLs
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the user who created the coin
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
