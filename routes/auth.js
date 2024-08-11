const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.status(400).send({ error: 'User already exists' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;
