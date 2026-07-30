const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Database connection error:", err));

const SearchHistorySchema = new mongoose.Schema({
  city: String,
  timestamp: { type: Date, default: Date.now }
});
const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);

// Handles both city text searches and geolocation coordinates
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

    // fetch current + forecast together to save a round trip
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(currentUrl),
      axios.get(forecastUrl)
    ]);

    const savedCity = currentRes.data.name;
    await SearchHistory.create({ city: savedCity });

    // UV index comes from Open-Meteo, a free API that needs no key or
    // subscription. Kept in its own try/catch so an outage there never
    // takes down the rest of the weather response.
    let uvIndex = null;
    try {
      const { lat: resolvedLat, lon: resolvedLon } = currentRes.data.coord;
      const uvUrl = `https://api.open-meteo.com/v1/forecast?latitude=${resolvedLat}&longitude=${resolvedLon}&current=uv_index`;
      const uvRes = await axios.get(uvUrl);
      uvIndex = uvRes.data.current.uv_index;
    } catch (uvError) {
      console.warn("UV index unavailable:", uvError.message);
    }

    res.json({
      current: { ...currentRes.data, uvi: uvIndex },
      forecast: forecastRes.data.list.filter((item, index) => index % 8 === 0) // one point per day
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching weather data", error: error.message });
  }
});

// Last 5 searched cities
app.get('/api/history', async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ timestamp: -1 }).limit(5);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
