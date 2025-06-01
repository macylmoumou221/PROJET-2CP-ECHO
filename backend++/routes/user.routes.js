const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadFile } = require('../middleware/upload.middleware');

// Get all users
router.get('/', protect, userController.getAllUsers);

// Get user profile
router.get('/:id', protect, userController.getUserProfile);

// Get user's posts
router.get('/:id/posts', protect, userController.getUserPosts);

// Get my posts
router.get('/my/posts', protect, userController.getMyPosts);

// Update profile
router.put('/profile', protect, uploadFile('profilePicture', 'profiles'), userController.updateProfile);

// Change password
router.put('/change-password', protect, userController.changePassword);

// Get saved posts
router.get('/saved/posts', protect, userController.getSavedPosts);

// Save post
router.post('/saved/posts/:postId', protect, userController.savePost);

// Unsave post
router.delete('/saved/posts/:postId', protect, userController.unsavePost);

// Report technical issue
router.post('/report-issue', protect, userController.reportTechnicalIssue);

module.exports = router;   