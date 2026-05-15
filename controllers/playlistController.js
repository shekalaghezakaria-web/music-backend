const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Create Playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverArt } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide playlist name',
      });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      user: req.userId,
      isPublic: isPublic || false,
      coverArt: coverArt || 'https://via.placeholder.com/300',
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Playlists
exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('user', 'name email')
      .populate('songs')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      playlists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Playlists
exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.userId })
      .populate('songs')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      playlists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Playlist
exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('user', 'name email')
      .populate('songs');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    res.status(200).json({
      success: true,
      playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add Song to Playlist
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check authorization
    if (playlist.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this playlist',
      });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Song already in playlist',
      });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song added to playlist',
      playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Song from Playlist
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;

    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check authorization
    if (playlist.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this playlist',
      });
    }

    playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
      playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check authorization
    if (playlist.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this playlist',
      });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Playlist
exports.updatePlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverArt } = req.body;

    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found',
      });
    }

    // Check authorization
    if (playlist.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this playlist',
      });
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverArt) playlist.coverArt = coverArt;

    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      playlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
