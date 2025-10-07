require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Сервер работает');
});

app.get('/get-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.helius.xyz/endpoint', {
      headers: {
        'Authorization': `Bearer ${process.env.HELIUS_API_KEY_1}`,
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при запросе данных от Helius API:', error);
    res.status(500).send('Ошибка при получении данных');
  }
});

app.post('/send-data', async (req, res) => {
  try {
    const response = await axios.post('https://api.helius.xyz/another-endpoint', {
      data: req.body,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HELIUS_API_KEY_2}`,
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при отправке данных в Helius API:', error);
    res.status(500).send('Ошибка при отправке данных');
  }
});

app.post('/laser-stream', async (req, res) => {
  try {
    const response = await axios.post('https://api.helius.xyz/laser-stream', {
      data: req.body,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HELIUS_API_KEY_3}`,
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при запросе LaserStream:', error);
    res.status(500).send('Ошибка при передаче данных');
  }
});

app.listen(port, () => {
  console.log(`Сервер слушает на http://localhost:${port}`);
});
