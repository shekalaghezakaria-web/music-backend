const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    default: 'Unknown Album',
  },
  genre: {
    type: String,
    default: 'General',
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  coverArt: {
    type: String,
    default: 'https://via.placeholder.com/300',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plays: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Song', songSchema);
