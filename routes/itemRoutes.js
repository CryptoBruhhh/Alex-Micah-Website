const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const Item = require('../models/Item');
// itemRoutes.js
const { isAuthenticated } = require('./auth');
const User = require('../models/User'); // Import the User model


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

router.post('/', isAuthenticated, upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'artwork', maxCount: 5 }
]), async (req, res) => {
    console.log('User creating item:', req.user);
    console.log(req.body); // Log the received form data
    console.log(req.files); // Log file data
    try {
        const { name, description, countdown } = req.body;
        const ticker = generateTicker(name);
        const endTime = new Date(Date.now() + countdown * 3600000);

        // Create a new item (coin)
        const newItem = new Item({
            name,
            description,
            ticker,
            // Store only the relative paths for the images
            icon: req.files.icon ? path.join('uploads', path.basename(req.files.icon[0].path)) : '',
            banner: req.files.banner ? path.join('uploads', path.basename(req.files.banner[0].path)) : '',
            artwork: req.files.artwork ? req.files.artwork.map(file => path.join('uploads', path.basename(file.path))) : [],
            endTime,
            createdBy: req.user  // Store the logged-in user's ID
        });

        console.log('New item before save:', newItem);

        // Save the new item
        await newItem.save();

        console.log('New item after save:', newItem);

        // Test to check if createdBy is set correctly
        const savedItem = await Item.findById(newItem._id).populate('createdBy', 'username');
        console.log('Saved item with populated createdBy:', savedItem);

        // Find the logged-in user and update their createdCoins array
        const user = await User.findById(req.user);
        user.createdCoins.push(ticker);
        await user.save();

        res.status(201).json({ message: 'Prelaunch posted successfully!' });
    } catch (error) {
        console.error('Failed to create item:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});


// GET route for a specific item by ticker
router.get('/:ticker', async (req, res) => {
    try {
        console.log('Fetching item with ticker:', req.params.ticker);
        const item = await Item.findOne({ ticker: req.params.ticker }).populate('createdBy', 'username');
        if (!item) {
            console.log('Item not found');
            return res.status(404).send('Item not found');
        }
        console.log('Item found:', JSON.stringify(item, null, 2));
        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).send('Server error');
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


// Route to fetch coins created by the logged-in user
router.get('/user-coins', isAuthenticated, async (req, res) => {
    try {
        // Find the logged-in user and populate their createdCoins field
        const user = await User.findById(req.user._id).populate('createdCoins');
        
        // Respond with the populated coins
        res.status(200).json(user.createdCoins);
    } catch (error) {
        console.error('Failed to fetch user coins:', error);
        res.status(500).json({ error: 'Failed to fetch user coins' });
    }
});

module.exports = router;
