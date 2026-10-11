const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});