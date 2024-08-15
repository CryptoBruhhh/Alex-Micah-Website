const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ticker: String,
    icon: String,
    banner: String,
    artwork: [String],
    endTime: { type: Date, required: true }  // Store the end time of the countdown
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;