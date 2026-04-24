const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Alamat service — pakai nama service dari Docker/K8s (bukan localhost!)
// Di Docker Compose & K8s, nama service dipakai sebagai hostname
const WEATHER_URL = process.env.WEATHER_SERVICE_URL || 'http://weather-service:3001';
const QUOTE_URL   = process.env.QUOTE_SERVICE_URL   || 'http://quote-service:3002';

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Microservices API Gateway',
    endpoints: {
      health: '/health',
      dashboard: '/dashboard',
      weather: '/weather',
      quote: '/quote'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Endpoint aggregator — memanggil kedua service sekaligus
app.get('/dashboard', async (req, res) => {
  console.log('--- Dashboard Request ---');
  
  const lat = req.query.lat || '-7.97';
  const lon = req.query.lon || '112.63';

  try {
    const [weatherResult, quoteResult] = await Promise.allSettled([
      axios.get(`${WEATHER_URL}/weather?lat=${lat}&lon=${lon}`),
      axios.get(`${QUOTE_URL}/quote`)
    ]);

    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value.data : null;
    const quote = quoteResult.status === 'fulfilled' ? quoteResult.value.data : null;

    // Kirim HTML Dashboard
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Microservice Dashboard</title>
          <style>
              :root {
                  --primary: #2563eb;
                  --bg: #f8fafc;
                  --card: #ffffff;
                  --text: #1e293b;
              }
              body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  background: var(--bg); 
                  color: var(--text);
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  min-height: 100vh;
              }
              .container { width: 90%; max-width: 800px; margin-top: 50px; }
              header { text-align: center; margin-bottom: 40px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
              .card { 
                  background: var(--card); 
                  padding: 25px; 
                  border-radius: 16px; 
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                  transition: transform 0.2s;
              }
              .card:hover { transform: translateY(-5px); }
              .card h2 { margin-top: 0; color: var(--primary); font-size: 1.2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              .quote-text { font-style: italic; font-size: 1.1rem; line-height: 1.6; }
              .quote-author { text-align: right; font-weight: bold; margin-top: 10px; color: #64748b; }
              .weather-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
              .weather-val { font-weight: 600; }
              .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
              .error { color: #dc2626; font-size: 0.9rem; }
              footer { margin-top: auto; padding: 20px; font-size: 0.8rem; color: #94a3b8; }
          </style>
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>🚀 Microservices Dashboard</h1>
                  <p>Gateway connected to Weather & Quote services</p>
              </header>
              
              <div class="grid">
                  <!-- Weather Section -->
                  <div class="card">
                      <h2>🌤️ Weather Info</h2>
                      ${weather ? `
                          <div class="weather-item"><span>Status</span> <span class="badge">${weather.weather.condition}</span></div>
                          <div class="weather-item"><span>Temperature</span> <span class="weather-val">${weather.weather.temperature}</span></div>
                          <div class="weather-item"><span>Humidity</span> <span class="weather-val">${weather.weather.humidity}</span></div>
                          <div class="weather-item"><span>Wind</span> <span class="weather-val">${weather.weather.wind_speed}</span></div>
                          <p style="font-size: 0.7rem; color: #94a3b8; margin-top: 15px;">Loc: ${weather.location.lat}, ${weather.location.lon}</p>
                      ` : `<p class="error">⚠️ Weather service unavailable</p>`}
                  </div>

                  <!-- Quote Section -->
                  <div class="card">
                      <h2>format_quote Daily Inspiration</h2>
                      ${quote ? `
                          <p class="quote-text">"${quote.quote.text}"</p>
                          <p class="quote-author">— ${quote.quote.author}</p>
                      ` : `<p class="error">⚠️ Quote service unavailable</p>`}
                  </div>
              </div>
          </div>
          <footer>
              API Gateway System &bull; ${new Date().toLocaleString()}
          </footer>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send(`<h1>Gateway Error</h1><p>${error.message}</p>`);
  }
});

// Proxy langsung ke weather service
app.get('/weather', async (req, res) => {
  try {
    const response = await axios.get(`${WEATHER_URL}/weather`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: 'Weather service tidak tersedia' });
  }
});

// Proxy langsung ke quote service
app.get('/quote', async (req, res) => {
  try {
    const response = await axios.get(`${QUOTE_URL}/quote`);
    res.json(response.data);
  } catch (err) {
    res.status(502).json({ error: 'Quote service tidak tersedia' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Gateway berjalan di port ${PORT}`);
  console.log(`   Weather Service URL : ${WEATHER_URL}`);
  console.log(`   Quote Service URL   : ${QUOTE_URL}`);
});