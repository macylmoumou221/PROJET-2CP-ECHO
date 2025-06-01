const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// Get events (all authenticated users)
router.get('/', protect, eventController.getEvents);

// Admin only routes
router.use(protect, authorizeRoles('admin'));

// Create event
router.post('/', eventController.createEvent);

// Update event
router.put('/:eventId', eventController.updateEvent);

// Delete event
router.delete('/:eventId', eventController.deleteEvent);

module.exports = router;