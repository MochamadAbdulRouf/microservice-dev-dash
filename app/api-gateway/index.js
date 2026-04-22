const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Alamat service — pakai nama service dari Docker/K8s (bukan localhost!)
// Di Docker Compose & K8s, nama service dipakai sebagai hostname
const WEATHER_URL = process.env.WEATHER_SERVICE_URL || 'http://weather-service:3001';
const QUOTE_URL   = process.env.QUOTE_SERVICE_URL   || 'http://quote-service:3002';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Endpoint aggregator — memanggil kedua service sekaligus
app.get('/dashboard', async (req, res) => {
  const lat = req.query.lat || '-7.97';
  const lon = req.query.lon || '112.63';

  try {
    // Promise.allSettled: panggil keduanya paralel
    // Tidak gagal total jika salah satu error
    const [weatherResult, quoteResult] = await Promise.allSettled([
      axios.get(`${WEATHER_URL}/weather?lat=${lat}&lon=${lon}`),
      axios.get(`${QUOTE_URL}/quote`)
    ]);

    const weather = weatherResult.status === 'fulfilled'
      ? weatherResult.value.data
      : { error: 'Weather service tidak tersedia' };

    const quote = quoteResult.status === 'fulfilled'
      ? quoteResult.value.data
      : { error: 'Quote service tidak tersedia' };

    res.json({
      gateway: 'api-gateway',
      timestamp: new Date().toISOString(),
      data: { weather, quote }
    });

  } catch (error) {
    res.status(500).json({ error: 'Gateway error', detail: error.message });
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