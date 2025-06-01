const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadFile } = require('../middleware/upload.middleware');

// Get all conversations
router.get('/conversations', protect, messageController.getConversations);

// Get messages between two users
router.get('/:userId', protect, messageController.getMessages);

// Send a message (HTTP fallback)
router.post('/:userId', 
  protect,
  uploadFile('media', 'messages'), 
  messageController.sendMessageHTTP
);

module.exports = router;