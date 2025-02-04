const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const scraper = require('./scraper');
const pageController = require('./controllers/pageController');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const app = express();
app.use(bodyParser.json());

// Routes
app.get('/pages/:username', pageController.getPage);
app.post('/pages/:username/summary', pageController.generateAISummary);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
