const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Notification = require('../models/notification.model');

// Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .populate('sender', 'username firstName lastName profilePicture')
      .populate('recipient', 'username firstName lastName')
      .lean();

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des notifications',
      error: error.message 
    });
  }
});

// Mark notification as read
router.post('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message 
    });
  }
});

module.exports = router;