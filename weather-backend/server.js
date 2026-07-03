const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas (using your .env file variable)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🚀 MongoDB Connected Successfully"))
  .catch(err => console.error("❌ Database connection error: ", err));

// 2. Define a Simple History Schema
const SearchHistorySchema = new mongoose.Schema({
  city: String,
  timestamp: { type: Date, default: Date.now }
});
const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);

// 3. Core API Route: Handles city text searches AND geolocation coordinates
app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query;
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  
  try {
    let currentUrl = '';
    let forecastUrl = '';

    if (city) {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    } else if (lat && lon) {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: "City name or coordinates required" });
    }

    // Call both endpoints at the same time to save latency
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(currentUrl),
      axios.get(forecastUrl)
    ]);

    // Automatically log this search to our MongoDB database
    const savedCity = currentRes.data.name;
    await SearchHistory.create({ city: savedCity });

    // Send unified payload back to React
    res.json({
      current: currentRes.data,
      forecast: forecastRes.data.list.filter((item, index) => index % 8 === 0) // Filters to 1 forecast point per day
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching weather data", error: error.message });
  }
});

// 4. History API Route: Fetches the last 5 searched cities
app.get('/api/history', async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ timestamp: -1 }).limit(5);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server smoothly running on port ${PORT}`));