const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  targetGroups: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^G[1-9]\d*$/.test(v);
      },
      message: props => `${props.value} n'est pas un format de groupe valide`
    }
  }],
  targetPromotions: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^20\d{2}$/.test(v) && parseInt(v) >= 2020 && parseInt(v) <= 2030;
      },
      message: props => `${props.value} n'est pas une année de promotion valide`
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Announcement', announcementSchema);