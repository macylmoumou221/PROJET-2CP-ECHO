const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { protect } = require('../middleware/auth.middleware');

// Create announcement (teachers only)
router.post('/', protect, announcementController.createAnnouncement);

// Get announcements
router.get('/', protect, announcementController.getAnnouncements);

module.exports = router;