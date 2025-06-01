const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['retrieved', 'not retrieved'],
    default: 'not retrieved'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);