const express = require('express');
const router = express.Router();
const recentlyPlayedController = require('../controllers/recentlyPlayedController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.post('/add', authMiddleware, recentlyPlayedController.addToRecentlyPlayed);
router.get('/all', authMiddleware, recentlyPlayedController.getRecentlyPlayed);
router.delete('/clear', authMiddleware, recentlyPlayedController.clearRecentlyPlayed);

module.exports = router;
