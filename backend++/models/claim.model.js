const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  details: {        
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'dealt', 'rejected'],
    default: 'pending'
  },
  response: {
    type: String,
    default: ''
  },
  isResponded: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('Claim', claimSchema);