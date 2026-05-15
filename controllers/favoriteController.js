const Favorite = require('../models/Favorite');
const Song = require('../models/Song');

// Add Song to Favorites
exports.addFavorite = async (req, res) => {
  try {
    const { songId } = req.body;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Check if already favorited
    let favorite = await Favorite.findOne({
      user: req.userId,
      song: songId,
    });

    if (favorite) {
      return res.status(400).json({
        success: false,
        message: 'Song already in favorites',
      });
    }

    favorite = await Favorite.create({
      user: req.userId,
      song: songId,
    });

    res.status(201).json({
      success: true,
      message: 'Song added to favorites',
      favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Song from Favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { songId } = req.body;

    const favorite = await Favorite.findOneAndDelete({
      user: req.userId,
      song: songId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Song removed from favorites',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User Favorites
exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .populate('song')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if Song is Favorited
exports.isFavorited = async (req, res) => {
  try {
    const { songId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.userId,
      song: songId,
    });

    res.status(200).json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
