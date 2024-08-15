const express = require('express');
const router = express.Router();
const multer = require('multer');
const Item = require('../models/Item');
const mongoose = require('mongoose');
const crypto = require('crypto');  // Import the crypto module

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads'); // Make sure this directory exists or multer will throw an error
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// POST route for creating an item
router.post('/', upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'artwork', maxCount: 5 }
]), async (req, res) => {
    const { name, description, countdown } = req.body;
    const ticker = generateTicker(name); // Function to generate ticker

    try {
        const newItem = new Item({
            name,
            description,
            ticker,
            icon: req.files.icon ? req.files.icon[0].path : '',
            banner: req.files.banner ? req.files.banner[0].path : '',
            artwork: req.files.artwork ? req.files.artwork.map(file => file.path) : [],
            countdown
        });
        await newItem.save();
        res.redirect('/'); // Redirect or handle response as needed
    } catch (error) {
        console.error('Failed to create item:', error);
        res.status(500).send('Failed to create item');
    }
});

function generateTicker(name) {
    // Simple example: first three letters of name + random hex string
    return name.substring(0, 3).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// GET route to fetch all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).send(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
