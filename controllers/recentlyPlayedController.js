const RecentlyPlayed = require('../models/RecentlyPlayed');

// Add to Recently Played
exports.addToRecentlyPlayed = async (req, res) => {
  try {
    const { songId } = req.body;

    // Delete if already exists (to update timestamp)
    await RecentlyPlayed.deleteOne({
      user: req.userId,
      song: songId,
    });

    // Add new entry
    const recentlyPlayed = await RecentlyPlayed.create({
      user: req.userId,
      song: songId,
    });

    res.status(201).json({
      success: true,
      message: 'Added to recently played',
      recentlyPlayed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Recently Played
exports.getRecentlyPlayed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentlyPlayed = await RecentlyPlayed.find({ user: req.userId })
      .populate('song')
      .sort({ playedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      recentlyPlayed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear Recently Played
exports.clearRecentlyPlayed = async (req, res) => {
  try {
    await RecentlyPlayed.deleteMany({ user: req.userId });

    res.status(200).json({
      success: true,
      message: 'Recently played history cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
