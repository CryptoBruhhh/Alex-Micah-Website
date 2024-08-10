//importing dependencies and modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
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

  // Add route for logging out. 
app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});



  // Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Add middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

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

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


// Add routes for viewing all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        let userList = users.map(user => `<li>Username: ${user.username}</li>`).join('');
        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>All Users</title>
            </head>
            <body>
                <h1>All Users</h1>
                <ul>${userList}</ul>
                <a href="/">Home</a>
            </body>
            </html>
        `;
        res.send(html);
    } catch (err) {
        console.error('Failed to fetch users:', err);
        res.status(500).send('Error fetching users');
    }
});
