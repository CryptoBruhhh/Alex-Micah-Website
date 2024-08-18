// Importing dependencies and modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Item = require('./models/Item'); // Import item model
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust storage settings as needed
const { router: authRoutes } = require('./routes/auth');
const itemRoutes = require('./routes/itemRoutes');


const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Middleware to parse body data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Middleware for handling cookies
app.use(cookieParser());

// Middleware to serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware to serve and log file access from 'uploads'
app.use('/uploads', (req, res, next) => {
    const fullPath = path.join(__dirname, 'uploads', req.url);
    console.log(`Attempting to serve file from: ${fullPath}`);
    next();
}, express.static(path.join(__dirname, 'uploads')));



// Routes

// Authentication routes
app.use('/auth', authRoutes);

// Item routes
app.use('/items', itemRoutes);

// Route for logging out
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Route for the home page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//  GET route to fetch user info
app.get('/user-info', async (req, res) => {
    if (!req.cookies.token) {
        return res.json({ username: null, createdCoins: [] });
        console.log('User:', user);
        console.log('Created Coins (tickers):', user.createdCoins);
        console.log('Found Items:', createdCoins);
    }
    try {
        const decoded = jwt.verify(req.cookies.token, 'your_jwt_secret');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch the full details of the user's created coins using the ticker
        const createdCoins = await Item.find({ ticker: { $in: user.createdCoins } })
                                       .select('name ticker endTime icon');

        res.json({
            username: user.username,
            photoUrl: user.photoUrl,
            createdCoins: createdCoins
        });
    } catch (err) {
        console.error('Failed to fetch user info:', err);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});



// GET route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});  // Fetch all users from MongoDB
        res.status(200).json(users);  // Sending JSON response with user data
    } catch (err) {
        console.error('Failed to fetch users:', err);
        res.status(500). send('Failed to fetch users');
    }
});

// Route to serve the item details page
app.get('/item-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'item-details.html'));
});

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});




// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
