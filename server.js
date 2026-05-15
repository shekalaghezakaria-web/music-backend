require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const recentlyPlayedRoutes = require('./routes/recentlyPlayedRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express
const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔥 FIXED CORS (IMPORTANT FOR VERCEL + MOBILE)
app.use(cors({
  origin: "*",
  credentials: true
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to Database
connectDB();

// =======================
// API ROUTES
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recently-played', recentlyPlayedRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`\n╔═════════════════════════════════════╗`);
  console.log(`║  Music Streaming Server Started    ║`);
  console.log(`║  Port: ${PORT}${' '.repeat(24 - PORT.toString().length)}║`);
  console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(15 - (process.env.NODE_ENV || 'development').length)}║`);
  console.log(`╚═════════════════════════════════════╝\n`);
});

module.exports = app;