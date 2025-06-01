const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadFile } = require('../middleware/upload.middleware');

// Create a post
router.post('/', protect, uploadFile('media', 'posts'), postController.createPost);

// Get all posts
router.get('/', protect, postController.getPosts);

// Get a single post
router.get('/:id', protect, postController.getPost);

// Update a post
router.put('/:id', protect, uploadFile('media', 'posts'), postController.updatePost);

// Delete a post
router.delete('/:id', protect, postController.deletePost);

// Upvote a post
router.post('/:id/upvote', protect, postController.upvotePost);

// Downvote a post
router.post('/:id/downvote', protect, postController.downvotePost);

// Save/unsave post
router.post('/:id/save', protect, postController.savePost);

// Comment on a post
router.post('/:id/comments', protect, postController.commentPost);

// Delete a comment
router.delete('/:id/comments/:commentId', protect, postController.deleteComment);

// Upvote a comment
router.post('/:id/comments/:commentId/upvote', protect, postController.upvoteComment);

// Downvote a comment
router.post('/:id/comments/:commentId/downvote', protect, postController.downvoteComment);

// Reply routes
router.post('/:id/comments/:commentId/replies', protect, postController.addReply);
router.put('/:id/comments/:commentId/replies/:replyId', protect, postController.updateReply);
router.delete('/:id/comments/:commentId/replies/:replyId', protect, postController.deleteReply);

// Reply voting routes
router.post('/:id/comments/:commentId/replies/:replyId/upvote', protect, postController.upvoteReply);
router.post('/:id/comments/:commentId/replies/:replyId/downvote', protect, postController.downvoteReply);

// Report a post
router.post('/:id/report', protect, postController.reportPost);

module.exports = router;