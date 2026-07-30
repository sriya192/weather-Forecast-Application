# Climate Dashboard - Weather & Climate Monitoring Dashboard

A responsive full-stack weather application built with **React**, **Node.js/Express**, and **Tailwind CSS**. The app delivers real-time weather updates, 5-day forecasts, atmospheric indicators (humidity, pressure, wind speed, UV index), and location auto-detection powered by the OpenWeather API.

---

## Key Features

* **Real-Time Weather Metrics:** Live updates for temperature, humidity, wind velocity, barometric pressure, visibility, and UV index.
* **5-Day Weather Forecast:** Daily projections with customized weather icons to help plan ahead.
* **Location Search & Auto-Detection:** Search for any city globally or use your device's geolocation with a single click.
* **Unit Conversion:** Easily toggle between Metric (°C) and Imperial (°F) units.
* **Dynamic Weather Alerts:** Displays contextual weather warnings and activity suggestions based on current ambient conditions.
* **Clean & Responsive UI:** Designed with dark mode UI components that scale seamlessly across desktop and mobile screens.

---

## Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, JavaScript (ES6+)
* **Backend:** Node.js, Express.js, Axios / Fetch API
* **External APIs:** OpenWeather API
* **Tooling & Linting:** Oxlint, npm

---

## Project Structure
```text
climate2/
├── weather-backend/
│   ├── node_modules/
│   ├── .env               # API keys and environment configuration
│   ├── .gitignore
│   ├── package.json       # Backend dependencies
│   ├── package-lock.json
│   └── server.js          # Express server and API routing gateway
└── weather-frontend/
    ├── node_modules/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src/
    │   ├── assets/
    │   ├── App.css
    │   ├── App.jsx        # Main UI layout and logic
    │   ├── index.css      # Tailwind imports & global styles
    │   └── main.jsx       # React entry point
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json       # Frontend dependencies
    ├── package-lock.json
    ├── README.md
    ├── tailwind.config.js
    └── vite.config.js