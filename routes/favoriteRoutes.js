const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.post('/add', authMiddleware, favoriteController.addFavorite);
router.post('/remove', authMiddleware, favoriteController.removeFavorite);
router.get('/all', authMiddleware, favoriteController.getUserFavorites);
router.get('/check/:songId', authMiddleware, favoriteController.isFavorited);

module.exports = router;
