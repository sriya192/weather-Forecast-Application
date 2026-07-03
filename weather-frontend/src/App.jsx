import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState(''); 
  const [isCelsius, setIsCelsius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://localhost:5000/api';
  const popularCities = ['Mumbai', 'New York', 'London', 'Tokyo', 'Paris'];

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error loading history from database", err);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const fetchWeather = async (searchParams) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/weather`, { params: searchParams });
      setWeatherData(res.data);
      fetchHistory(); 
    } catch (err) {
      setError('City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        () => setError('Location access denied by browser.')
      );
    } else {
      setError('Geolocation is not supported by this browser setup.');
    }
  };

  const getBackgroundClass = () => {
    if (!weatherData) return 'from-blue-500 to-indigo-700';
    const main = weatherData.current.weather[0].main;
    if (main === 'Rain' || main === 'Drizzle') return 'from-slate-700 to-slate-900';
    if (main === 'Clouds') return 'from-blue-600 to-slate-500';
    if (main === 'Clear') return 'from-orange-400 to-amber-600';
    return 'from-blue-500 to-indigo-700';
  };

  const getSmartRecommendation = (temp, condition) => {
    let basePhrase = "";
    if (condition.includes('Rain') || condition.includes('Drizzle')) {
      basePhrase = "🌧️ Pack an umbrella and wear waterproof shoes today!";
    } else if (temp > 30) {
      basePhrase = "☀️ It's hot! Wear lightweight cotton clothing, shades, and stay hydrated.";
    } else if (temp < 15) {
      basePhrase = "❄️ Chilly weather. Grab a thick jacket or sweater before heading out.";
    } else {
      basePhrase = "🌤️ Perfect weather! Great day for outdoor activities or a casual walk.";
    }

    const extraInsight = temp > 25 ? " 🥤 Quick Tip: An iced coffee sounds great right about now." : " ☕ Quick Tip: Perfect timing for a warm beverage!";
    return basePhrase + extraInsight;
  };

  
  const getWeatherHazards = () => {
    if (!weatherData) return null;
    const speed = weatherData.current.wind.speed;
    const humidity = weatherData.current.main.humidity;
    const mainCondition = weatherData.current.weather[0].main;

    let alerts = [];
    if (speed > 8) alerts.push("⚠️ High Wind Warning: Secure loose outdoor items.");
    if (humidity > 75 && weatherData.current.main.temp > 28) alerts.push("🥵 Sticky Heat Index: Stay in air-conditioned areas if possible.");
    if (mainCondition === 'Thunderstorm') alerts.push("⚡ Lightning Risk: Keep indoors and unplug sensitive electronics.");
    
  
    if (alerts.length === 0) {
      return "✅ Atmospheric Safety: No severe weather or climate hazards detected.";
    }
    return alerts.join(" | ");
  };

  const formatTemp = (celsius) => {
    if (isCelsius) return `${Math.round(celsius)}°C`;
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  };

  const getWeatherEmoji = (main) => {
    switch (main) {
      case 'Clear': return '☀️';
      case 'Clouds': return '☁️';
      case 'Rain': return '🌧️';
      case 'Drizzle': return '🌦️';
      case 'Thunderstorm': return '⛈️';
      case 'Snow': return '❄️';
      default: return '🌫️';
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  
  const filteredHistory = history.filter(item => 
    item.city.toLowerCase().includes(historyFilter.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} text-white p-6 flex flex-col items-center transition-all duration-500`}>
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl mt-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide ml-2">🌦️ ClimateDash</h1>
          <button 
            onClick={() => setIsCelsius(!isCelsius)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-semibold border border-white/20 transition"
          >
            Switch to {isCelsius ? '°F' : '°C'}
          </button>
        </div>

        {/* Popular Cities Bar */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {popularCities.map((c) => (
            <button
              key={c}
              onClick={() => fetchWeather({ city: c })}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm font-medium transition"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Input Controls Panel */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search for a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
          />
          <button 
            onClick={() => fetchWeather({ city })}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition"
          >
            Search
          </button>
          <button 
            onClick={handleAutoDetect}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            📍 Auto-Detect
          </button>
        </div>

        {error && <p className="text-red-300 font-semibold mb-4 text-center">{error}</p>}
        {loading && <p className="text-white/80 font-medium text-center animate-pulse">Loading live climate metrics...</p>}

        {weatherData && !loading && (
          <div>
            {/*  NEW COMPONENT: Hazard & Warning Ticker Banner */}
            <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-xl text-center text-xs font-semibold tracking-wide animate-pulse">
              {getWeatherHazards()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              
              {/* Main Current Weather Card */}
              <div className="md:col-span-2 bg-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-extrabold">{weatherData.current.name}</h2>
                    <p className="text-xl capitalize text-white/80 mt-1">{weatherData.current.weather[0].description}</p>
                  </div>
                  <div className="w-20 h-20 bg-white/25 rounded-full flex items-center justify-center text-4xl shadow-inner">
                    {getWeatherEmoji(weatherData.current.weather[0].main)}
                  </div>
                </div>
                
                <div className="my-6">
                  <span className="text-6xl font-black">{formatTemp(weatherData.current.main.temp)}</span>
                </div>

                {/* Recommendation Box */}
                <div className="bg-amber-500/20 border border-amber-400/30 p-3 rounded-xl text-sm font-medium transition-all">
                  {getSmartRecommendation(weatherData.current.main.temp, weatherData.current.weather[0].main)}
                </div>

                {/* Extended Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10 text-sm">
                  <div>💧 Humidity: <b className="block text-base">{weatherData.current.main.humidity}%</b></div>
                  <div>💨 Wind Velocity: <b className="block text-base">{weatherData.current.wind.speed} m/s</b></div>
                  <div>📉 Barometric: <b className="block text-base">{weatherData.current.main.pressure} hPa</b></div>
                  <div>👁️ Visibility Range: <b className="block text-base">{(weatherData.current.visibility / 1000).toFixed(1)} km</b></div>
                  <div>🌅 Sunrise Clock: <b className="block text-base">{new Date(weatherData.current.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b></div>
                  <div>🌇 Sunset Clock: <b className="block text-base">{new Date(weatherData.current.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b></div>
                </div>
              </div>

              {/* Sidebar Columns */}
              <div className="flex flex-col gap-6">
                
                {/* History Card with built-in filter search input */}
                <div className="bg-black/20 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-white/70 text-sm tracking-wider uppercase">Recent Searches</h3>
                    {history.length > 0 && (
                      <button 
                        onClick={handleClearHistory} 
                        className="text-xs text-red-300 hover:text-red-400 underline transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* NEW COMPONENT: History Panel Sub-Filter */}
                  {history.length > 0 && (
                    <input 
                      type="text"
                      placeholder="Filter history log..."
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="w-full mb-3 px-3 py-1 text-xs bg-white/10 rounded-md placeholder-white/40 text-white focus:outline-none"
                    />
                  )}

                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                    {filteredHistory.map((item, index) => (
                      <button
                        key={item._id || index}
                        onClick={() => fetchWeather({ city: item.city })}
                        className="text-left bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-sm transition font-medium"
                      >
                        🕒 {item.city}
                      </button>
                    ))}
                    {filteredHistory.length === 0 && history.length > 0 && (
                      <p className="text-xs text-white/40 text-center py-2">No matching city found.</p>
                    )}
                  </div>
                </div>

                {/* 5-Day Forecast Grid */}
                <div className="bg-white/5 p-4 rounded-2xl flex-1">
                  <h3 className="font-bold mb-3 text-white/70 text-sm tracking-wider uppercase">5-Day Forecast</h3>
                  <div className="flex flex-col gap-3">
                    {weatherData.forecast.map((day, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-xs">
                        <span>{new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-xl w-8 text-center">{getWeatherEmoji(day.weather[0].main)}</span>
                        <span className="font-bold">{formatTemp(day.main.temp)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;