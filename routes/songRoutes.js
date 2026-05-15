const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { uploadSong } = require('../middleware/upload');

// Public Routes
router.get('/all', songController.getAllSongs);
router.get('/trending', songController.getTrendingSongs);
router.get('/recommended', songController.getRecommendedSongs);
router.get('/:id', songController.getSong);
router.get('/stream/:id', songController.streamSong);

// Protected Routes
router.post('/upload', authMiddleware, uploadSong.single('file'), songController.uploadSong);
router.delete('/:id', authMiddleware, songController.deleteSong);
router.put('/likes/:id', authMiddleware, songController.updateSongLikes);

module.exports = router;
