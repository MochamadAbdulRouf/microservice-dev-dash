const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Health check endpoint — penting untuk Kubernetes liveness probe
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'weather-service' });
});

// Endpoint utama: GET /weather?lat=-7.97&lon=112.63
// Default: koordinat Blitar, Jawa Timur
app.get('/weather', async (req, res) => {
  const lat = req.query.lat || '-7.97';
  const lon = req.query.lon || '112.63';

  try {
    // Panggil Open-Meteo API — GRATIS, tanpa API key!
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
        timezone: 'Asia/Jakarta'
      }
    });

    const current = response.data.current;

    // Mapping weather code ke deskripsi
    const weatherDescriptions = {
      0: 'Cerah', 1: 'Sebagian Cerah', 2: 'Berawan Sebagian',
      3: 'Mendung', 45: 'Berkabut', 61: 'Hujan Ringan',
      63: 'Hujan Sedang', 65: 'Hujan Lebat', 80: 'Hujan Gerimis',
      95: 'Badai Petir'
    };

    res.json({
      service: 'weather-service',
      location: { lat, lon },
      weather: {
        temperature: `${current.temperature_2m}°C`,
        humidity: `${current.relative_humidity_2m}%`,
        wind_speed: `${current.wind_speed_10m} km/h`,
        condition: weatherDescriptions[current.weather_code] || 'Tidak Diketahui',
        updated_at: current.time
      }
    });

  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data cuaca saat ini', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Weather Service berjalan di port ${PORT}`);
});