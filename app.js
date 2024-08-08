const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Connect to DABASE HERE. (chose mongodb, i prefer sql oracle tho)
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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/auth', authRoutes);

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
