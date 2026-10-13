const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const meRoutes = require('./routes/meRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 3000;

// Whitelist các domain được phép truy cập
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:5173',  // Local Frontend
  'http://localhost:3000',  // Local Backend
]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (như curl, Postman, test report nội bộ)
      if (!origin) return callback(null, true);

      const reqOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(reqOrigin)) {
        return callback(null, true);
      }

      // Chặn toàn bộ các domain lạ bên ngoài
      return callback(new Error(`CORS policy: ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, data: { status: 'ok', database: 'connected' } });
  } catch (error) {
    console.error('MySQL connection error:', error.message);
    res.status(503).json({ success: false, message: 'Database disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});

module.exports = app;