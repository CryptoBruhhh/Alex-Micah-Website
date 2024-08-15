const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads'); // Define uploadDir correctly outside of any function
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);  // Use the defined uploadDir
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the timestamp + original file extension
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Middleware to verify if the user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in to perform this action.' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Add route for signing up
router.post('/signup', upload.single('profilePic'), async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            // Store relative path in the database
            photoUrl: req.file ? path.join('uploads', req.file.filename) : '' // Save the relative path
        });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.cookie('token', token, { httpOnly: true });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add route for logging in
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add route for logging out
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = {
    isAuthenticated,
    router
};
