const express = require('express');
const router = express.Router();
const multer = require('multer');
const Item = require('../models/Item');
const crypto = require('crypto'); // Import the crypto module
const { isAuthenticated } = require('./auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads'); // Ensure this directory exists or multer will throw an error
    },
    // Add a timestamp to the file name
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max file size
    }
});

// POST route for creating an item
router.post('/', isAuthenticated, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'artwork', maxCount: 5 }
]), async (req, res) => {
    console.log(req.body); // Log the received form data
    console.log(req.files); // Log file data
    try {
        const { name, description, countdown } = req.body;
        const ticker = generateTicker(name);
        const endTime = new Date(Date.now() + countdown * 3600000);

        const newItem = new Item({
            name,
            description,
            ticker,
            icon: req.files.icon ? req.files.icon[0].path : '',
            banner: req.files.banner ? req.files.banner[0].path : '',
            artwork: req.files.artwork ? req.files.artwork.map(file => file.path) : [],
            endTime
        });
        await newItem.save();
        res.status(201).json({ message: 'Prelaunch posted successfully!' });
    } catch (error) {
        console.error('Failed to create item:', error);
        res.status(500).json({ error: 'Failed to create item' });
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
        res.status(200).json(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET route for a specific item by ticker
router.get('/:ticker', async (req, res) => {
    try {
        const item = await Item.findOne({ ticker: req.params.ticker });
        if (!item) {
            return res.status(404).send('Item not found');
        }
        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
