const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    start: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/  // HH:mm format
    },
    end: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/  // HH:mm format
    }
  },
  type: {
    type: String,
    enum: ['exam', 'holiday', 'deadline', 'other'],
    default: 'other'
  },
  visibility: {
    type: String,
    enum: ['all', 'students', 'teachers'],
    default: 'all'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetGroups: [{
    type: String
  }],
  targetPromotions: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);