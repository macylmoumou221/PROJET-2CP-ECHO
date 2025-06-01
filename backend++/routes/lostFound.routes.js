const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFound.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadFile } = require('../middleware/upload.middleware');

// Create a lost or found item report
router.post('/', protect, uploadFile('image', 'lostfound'), lostFoundController.createItem);

// Get all lost and found items
router.get('/', protect, lostFoundController.getItems);

// Get my reported items
router.get('/my-items', protect, lostFoundController.getMyItems);

// Get a specific item
router.get('/:itemId', protect, lostFoundController.getItem);

// Update item status
router.put('/:itemId/status', protect, lostFoundController.updateItemStatus);

// Delete an item report
router.delete('/:itemId', protect, lostFoundController.deleteItem);

module.exports = router;