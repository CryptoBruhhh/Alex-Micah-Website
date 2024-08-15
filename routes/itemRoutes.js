const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const Item = require('../models/Item');
// itemRoutes.js
const { isAuthenticated } = require('./auth');


// Ensure the 'uploads' directory exists
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);  // Use the checked and created uploads directory
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});

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
        fileSize: 1024 * 1024 * 5  // 5MB max file size
    }
});

// Function to generate a ticker for an item
function generateTicker(name) {
    return name.substring(0, 3).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// POST route for creating an item
router.post('/', isAuthenticated, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'artwork', maxCount: 5 }
]), async (req, res) => {
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
