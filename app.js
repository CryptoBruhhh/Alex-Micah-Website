//importing dependencies and modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Item = require('./models/Item'); // Import item model
const app = express();
const multer = require('multer');
const itemRoutes = require('./routes/itemRoutes'); // Adjust the path as necessary
const upload = multer({ dest: 'uploads/' }); // Adjust storage settings as needed

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



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Add middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
//// Middleware to log the full path of static file requests
app.use('/uploads', (req, res, next) => {
    const fullPath = path.join(__dirname, 'uploads', req.url);
    console.log(`Attempting to serve file from: ${fullPath}`);
    next();
}, express.static(path.join(__dirname, 'uploads')));
// Add middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Add middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Add middleware to parse JSON request bodies
app.use(express.json());

// Routes
// Add route for logging out
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Add routes for items
app.use('/items', itemRoutes);


// Add routes for authentication
app.use('/auth', authRoutes);

// Add route for home page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add route for user info
app.get('/user-info', async (req, res) => {
    if (!req.cookies.token) {
        return res.json({ username: null });
    }
    try {
        const decoded = jwt.verify(req.cookies.token, 'your_jwt_secret');
        const user = await User.findById(decoded.userId);
        res.json({ username: user.username });
    } catch (err) {
        res.json({ username: null });
    }
});

// GET route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});  // Fetch all users from MongoDB
        res.status(200).json(users);  // Sending JSON response with user data
    } catch (err) {
        console.error('Failed to fetch users:', err);
        res.status(500).send('Failed to fetch users');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});



