const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3002;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'quote-service' });
});

// Endpoint: GET /quote — ambil 1 quote motivasi random
app.get('/quote', async (req, res) => {
  try {
    // ZenQuotes API — GRATIS, tanpa API key!
    const response = await axios.get('https://zenquotes.io/api/random');
    const data = response.data[0];

    res.json({
      service: 'quote-service',
      quote: {
        text: data.q,
        author: data.a
      }
    });

  } catch (error) {
    console.error('Quote API error:', error.message);
    // Fallback quote kalau API gagal
    res.json({
      service: 'quote-service',
      quote: {
        text: 'Belajar DevOps itu proses, bukan tujuan.',
        author: 'Senior DevOps Engineer'
      },
      source: 'fallback'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Quote Service berjalan di port ${PORT}`);
});