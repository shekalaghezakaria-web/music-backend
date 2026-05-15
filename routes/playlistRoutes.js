const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/auth');

// Protected Routes
router.post('/create', authMiddleware, playlistController.createPlaylist);
router.get('/all', authMiddleware, playlistController.getAllPlaylists);
router.get('/user', authMiddleware, playlistController.getUserPlaylists);
router.get('/:id', authMiddleware, playlistController.getPlaylist);
router.post('/:id/add-song', authMiddleware, playlistController.addSongToPlaylist);
router.post('/:id/remove-song', authMiddleware, playlistController.removeSongFromPlaylist);
router.put('/:id', authMiddleware, playlistController.updatePlaylist);
router.delete('/:id', authMiddleware, playlistController.deletePlaylist);

module.exports = router;
