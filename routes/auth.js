const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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

// Add route for signing up
// Update the signup route
router.post('/signup', upload.single('profilePic'), async (req, res) => {
    const { username, password } = req.body;
    console.log('Signup attempt for username:', username);
    console.log('Provided password during signup:', password); // Remove in production
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            console.log('User already exists:', username);
            return res.status(400).json({ error: 'User already exists' });
        }
        // Remove the bcrypt.hash call here, as it's done in the User model
        const user = new User({
            username,
            password, // Store the plain password, it will be hashed by the pre-save hook
            photoUrl: req.file ? path.join('uploads', req.file.filename) : ''
        });
        await user.save();
        console.log('New user created:', username);

        // Verify the stored password
        const savedUser = await User.findOne({ username });
        console.log('Stored hashed password after save:', savedUser.password);

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
    console.log('Login attempt for username:', username);
    console.log('Provided password during login:', password); // Remove in production
    try {
        // Check for duplicate users
        const users = await User.find({ username });
        console.log('Number of users found:', users.length);
        users.forEach((user, index) => {
            console.log(`User ${index + 1} password hash:`, user.password);
        });

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        console.log('Stored hashed password:', user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        console.log('Generated token:', token);
        res.cookie('token', token, { httpOnly: true });
        console.log('Login successful for user:', username);
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
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    isAuthenticated,
    router
};