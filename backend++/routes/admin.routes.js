const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

// Admin routes (protected and restricted to admin role)
router.use(protect, authorizeRoles('admin'));

// Get all users
router.get('/users', adminController.getUsers);

// Update user
router.put('/users/:userId', adminController.updateUser);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

// Get reported posts
router.get('/reported-posts', adminController.getReportedPosts);

// Moderate a post
router.put('/posts/:postId/moderate', adminController.moderatePost);

// Get dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Send global notification
router.post('/send-notification', adminController.sendGlobalNotification);

// Moderate lost and found items
router.put('/lostfound/:itemId/moderate', adminController.moderateLostFound);

module.exports = router;