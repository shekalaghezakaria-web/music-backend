const Song = require('../models/Song');
const path = require('path');
const fs = require('fs');

// Upload Song
exports.uploadSong = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { title, artist, album, genre, duration } = req.body;
    const coverArt = req.body.coverArt || 'https://via.placeholder.com/300';

    if (!title || !artist || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, artist, and duration',
      });
    }

    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'General',
      duration: parseInt(duration),
      filePath: req.file.path.replace(/\\/g, '/'),
      coverArt,
      uploadedBy: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      song,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Songs
exports.getAllSongs = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 20 } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre) {
      filter.genre = genre;
    }

    const skip = (page - 1) * limit;

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Song.countDocuments(filter);

    res.status(200).json({
      success: true,
      songs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Trending Songs
exports.getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find({ trending: true })
      .populate('uploadedBy', 'name email')
      .sort({ plays: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      songs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Recommended Songs
exports.getRecommendedSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate('uploadedBy', 'name email')
      .sort({ likes: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      songs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Song
exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'name email');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    res.status(200).json({
      success: true,
      song,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Song
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    // Check authorization
    if (song.uploadedBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this song',
      });
    }

    // Delete file
    if (fs.existsSync(song.filePath)) {
      fs.unlinkSync(song.filePath);
    }

    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Stream Song
exports.streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    const filePath = song.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Song Likes
exports.updateSongLikes = async (req, res) => {
  try {
    const { action } = req.body; // 'increment' or 'decrement'

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found',
      });
    }

    if (action === 'increment') {
      song.likes += 1;
    } else if (action === 'decrement') {
      song.likes = Math.max(0, song.likes - 1);
    }

    await song.save();

    res.status(200).json({
      success: true,
      message: 'Song updated successfully',
      song,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
