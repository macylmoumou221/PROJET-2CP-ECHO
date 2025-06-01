const Post = require('../models/post.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { title, content, media } = req.body;
    
    // Create post
    const post = new Post({
      author: req.user._id,
      title,
      content
    });
    
    // Handle media (either file upload or URL)
    if (req.file) {
      post.media = `${process.env.FRONTEND_URL}/uploads/posts/${req.file.filename}`;
      post.mediaType = 'image';
    } else if (media) {
      post.media = media;
      post.mediaType = 'image'; // Set mediaType for URLs too
    }
    
    await post.save();
    
    // Populate author information
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture role')
      .lean();
    
    res.status(201).json({
      message: 'Post créé avec succès',
      post: populatedPost
    });
  } catch (error) {
    console.error('Erreur de création de post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du post',
      error: error.message
    });
  }
};

// Rest of th

// Get all posts with search and filters
exports.getPosts = async (req, res) => {
  try {
    const { search, author, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isDeleted: false };
    
    // Search in title and content
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by author if provided
    if (author) {
      filter.author = author;
    }

    // Filter by type if provided
    if (type) {
      filter.type = type;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName profilePicture role')
      .populate({
        path: 'comments.user',
        select: 'username firstName lastName profilePicture role'
      })
      .populate({
        path: 'comments.replies.user',
        select: 'username firstName lastName profilePicture role'
      })
      .lean() || [];  // Provide empty array fallback

    const total = await Post.countDocuments(filter);

    // Get user's saved posts with proper null checks
    const user = await User.findById(req.user?._id).select('savedPosts').lean();
    const savedPosts = user?.savedPosts || [];
    
    // Add counts and flags to each post with null checks
    const postsWithCounts = posts.map(post => ({
      ...post,
      upvoteCount: post?.upvotes?.length || 0,
      downvoteCount: post?.downvotes?.length || 0,
      commentCount: post?.comments?.length || 0,
      hasUpvoted: post?.upvotes?.some(id => id?.toString() === req?.user?._id?.toString()) || false,
      hasDownvoted: post?.downvotes?.some(id => id?.toString() === req?.user?._id?.toString()) || false,
      isSaved: savedPosts?.some(id => id?.toString() === post?._id?.toString()) || false
    }));

    res.status(200).json({
      posts: postsWithCounts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur de récupération des posts:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des posts',
      error: error.message
    });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate post ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'ID de post invalide' 
      });
    }

    const post = await Post.findOne({ _id: id, isDeleted: false })
      .populate('author', 'username firstName lastName profilePicture role')
      .populate({
        path: 'comments.user',
        select: 'username firstName lastName profilePicture role'
      })
      .populate({
        path: 'comments.replies.user',
        select: 'username firstName lastName profilePicture role'
      })
      .lean();

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    // Get user's saved posts with null checks
    const user = await User.findById(req.user?._id).select('savedPosts').lean();
    const savedPosts = user?.savedPosts || [];

    // Add interaction flags with null checks
    const postWithFlags = {
      ...post,
      upvoteCount: post?.upvotes?.length || 0,
      downvoteCount: post?.downvotes?.length || 0,
      commentCount: post?.comments?.length || 0,
      hasUpvoted: post?.upvotes?.some(id => id?.toString() === req?.user?._id?.toString()) || false,
      hasDownvoted: post?.downvotes?.some(id => id?.toString() === req?.user?._id?.toString()) || false,
      isSaved: savedPosts?.some(id => id?.toString() === post?._id?.toString()) || false
    };

    res.status(200).json(postWithFlags);
  } catch (error) {
    console.error('Erreur de récupération du post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du post',
      error: error.message
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier ce post' 
      });
    }

    const { title, content } = req.body;

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;

    // Handle media update
    if (req.file) {
      // Delete old media if exists
      if (post.media && !post.media.startsWith('http')) {
        const mediaPath = path.join(__dirname, '..', post.media.replace(process.env.FRONTEND_URL, ''));
        if (fs.existsSync(mediaPath)) {
          fs.unlinkSync(mediaPath);
        }
      }

      post.media = `${process.env.FRONTEND_URL}/uploads/posts/${req.file.filename}`;
      post.mediaType = 'image';
    }

    await post.save();

    // Populate author information
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePicture role')
      .lean();

    res.status(200).json({
      message: 'Post mis à jour avec succès',
      post: updatedPost
    });
  } catch (error) {
    console.error('Erreur de mise à jour du post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du post',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer ce post' 
      });
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    res.status(200).json({
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression du post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du post',
      error: error.message
    });
  }
};

// Upvote a post
exports.upvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const hasUpvoted = post.upvotes.includes(req.user._id);
    const hasDownvoted = post.downvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add upvote and remove downvote if exists
      post.upvotes.push(req.user._id);
      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasUpvoted ? 'Upvote retiré' : 'Post upvoté avec succès',
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: !hasUpvoted,
      hasDownvoted: false
    });
  } catch (error) {
    console.error('Erreur d\'upvote:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upvote',
      error: error.message
    });
  }
};

// Downvote a post
exports.downvotePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const hasUpvoted = post.upvotes.includes(req.user._id);
    const hasDownvoted = post.downvotes.includes(req.user._id);

    if (hasDownvoted) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add downvote and remove upvote if exists
      post.downvotes.push(req.user._id);
      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasDownvoted ? 'Downvote retiré' : 'Post downvoté avec succès',
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted
    });
  } catch (error) {
    console.error('Erreur de downvote:', error);
    res.status(500).json({ 
      message: 'Erreur lors du downvote',
      error: error.message
    });
  }
};

// Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const { text, parentCommentId } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        message: 'Le commentaire ne peut pas être vide' 
      });
    }

    if (parentCommentId) {
      // Add reply to existing comment
      const comment = post.comments.id(parentCommentId);
      if (!comment) {
        return res.status(404).json({ 
          message: 'Commentaire parent non trouvé' 
        });
      }

      comment.replies.push({
        user: req.user._id,
        text
      });
    } else {
      // Add new comment
      post.comments.push({
        user: req.user._id,
        text
      });
    }

    await post.save();

    // Notify post author of new comment
    if (post.author.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'post_comment',
          content: 'a commenté votre post',
          relatedId: post._id,
          onModel: 'Post'
        });
        console.log('Notification de commentaire créée avec succès');
      } catch (notifError) {
        console.error('Erreur création notification:', notifError);
      }
    }

    // Get updated post with populated comments
    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username firstName lastName profilePicture role')
      .populate('comments.replies.user', 'username firstName lastName profilePicture role')
      .lean() || { comments: [] };

    res.status(200).json({
      message: 'Commentaire ajouté avec succès',
      comments: updatedPost?.comments || []
    });
  } catch (error) {
    console.error('Erreur d\'ajout de commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        message: 'Commentaire non trouvé' 
      });
    }

    // Check if user is the comment author or post author or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire' 
      });
    }

    comment.remove();
    await post.save();

    res.status(200).json({
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression de commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
};

// Upvote a comment
exports.upvoteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        message: 'Commentaire non trouvé' 
      });
    }

    const hasUpvoted = comment.upvotes.includes(req.user._id);
    const hasDownvoted = comment.downvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add upvote and remove downvote if exists
      comment.upvotes.push(req.user._id);
      if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasUpvoted ? 'Upvote retiré' : 'Commentaire upvoté avec succès',
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      hasUpvoted: !hasUpvoted,
      hasDownvoted: false
    });
  } catch (error) {
    console.error('Erreur d\'upvote de commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upvote du commentaire',
      error: error.message
    });
  }
};

// Downvote a comment
exports.downvoteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        message: 'Commentaire non trouvé' 
      });
    }

    const hasUpvoted = comment.upvotes.includes(req.user._id);
    const hasDownvoted = comment.downvotes.includes(req.user._id);

    if (hasDownvoted) {
      // Remove downvote
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add downvote and remove upvote if exists
      comment.downvotes.push(req.user._id);
      if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasDownvoted ? 'Downvote retiré' : 'Commentaire downvoté avec succès',
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted
    });
  } catch (error) {
    console.error('Erreur de downvote de commentaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors du downvote du commentaire',
      error: error.message
    });
  }
};

// Add reply to a comment
exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const parentComment = post.comments.id(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Commentaire parent non trouvé' });
    }

    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'La réponse ne peut pas être vide' });
    }

    // Add reply
    parentComment.replies.push({
      user: req.user._id,
      text: text.trim()
    });

    await post.save();

    // Notify comment author of new reply
    if (parentComment.user.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: parentComment.user,
          sender: req.user._id,
          type: 'comment_reply',
          content: 'a répondu à votre commentaire',
          relatedId: post._id,
          onModel: 'Post'
        });
        console.log('Notification de réponse créée avec succès');
      } catch (notifError) {
        console.error('Erreur création notification:', notifError);
      }
    }

    // Get updated post with populated replies - don't use lean()
    const updatedPost = await Post.findById(post._id)
      .populate('comments.user', 'username firstName lastName profilePicture role')
      .populate('comments.replies.user', 'username firstName lastName profilePicture role');

    const updatedComment = updatedPost.comments.id(req.params.commentId);

    res.status(200).json({
      message: 'Réponse ajoutée avec succès',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Erreur d\'ajout de réponse:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'ajout de la réponse',
      error: error.message
    });
  }
};

// Update a reply
exports.updateReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Réponse non trouvée' });
    }

    // Check if user is the reply author
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier cette réponse' });
    }

    // Update reply
    reply.text = req.body.text;
    reply.edited = true;
    await post.save();

    res.status(200).json({
      message: 'Réponse mise à jour avec succès',
      reply
    });
  } catch (error) {
    console.error('Erreur de mise à jour de réponse:', error);
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la réponse',
      error: error.message
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Réponse non trouvée' });
    }

    // Check if user is the reply author or admin
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer cette réponse' });
    }

    reply.remove();
    await post.save();

    res.status(200).json({
      message: 'Réponse supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression de réponse:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression de la réponse',
      error: error.message
    });
  }
};

// Upvote a reply
exports.upvoteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Réponse non trouvée' });
    }

    const hasUpvoted = reply.upvotes.includes(req.user._id);
    const hasDownvoted = reply.downvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      reply.upvotes = reply.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add upvote and remove downvote if exists
      reply.upvotes.push(req.user._id);
      if (hasDownvoted) {
        reply.downvotes = reply.downvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasUpvoted ? 'Upvote retiré' : 'Réponse upvotée avec succès',
      upvotes: reply.upvotes.length,
      downvotes: reply.downvotes.length,
      hasUpvoted: !hasUpvoted,
      hasDownvoted: false
    });
  } catch (error) {
    console.error('Erreur d\'upvote de réponse:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'upvote de la réponse',
      error: error.message
    });
  }
};

// Downvote a reply
exports.downvoteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Réponse non trouvée' });
    }

    const hasUpvoted = reply.upvotes.includes(req.user._id);
    const hasDownvoted = reply.downvotes.includes(req.user._id);

    if (hasDownvoted) {
      // Remove downvote
      reply.downvotes = reply.downvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add downvote and remove upvote if exists
      reply.downvotes.push(req.user._id);
      if (hasUpvoted) {
        reply.upvotes = reply.upvotes.filter(id => id.toString() !== req.user._id.toString());
      }
    }

    await post.save();

    res.status(200).json({
      message: hasDownvoted ? 'Downvote retiré' : 'Réponse downvotée avec succès',
      upvotes: reply.upvotes.length,
      downvotes: reply.downvotes.length,
      hasUpvoted: false,
      hasDownvoted: !hasDownvoted
    });
  } catch (error) {
    console.error('Erreur de downvote de réponse:', error);
    res.status(500).json({
      message: 'Erreur lors du downvote de la réponse',
      error: error.message
    });
  }
};

// Report a post
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ 
        message: 'La raison du signalement est requise' 
      });
    }

    // Check if user has already reported this post
    const hasReported = post.reports.some(report => 
      report.user.toString() === req.user._id.toString()
    );

    if (hasReported) {
      return res.status(400).json({ 
        message: 'Vous avez déjà signalé ce post' 
      });
    }

    post.reports.push({
      user: req.user._id,
      reason
    });

    await post.save();

    res.status(200).json({
      message: 'Post signalé avec succès'
    });
  } catch (error) {
    console.error('Erreur de signalement de post:', error);
    res.status(500).json({ 
      message: 'Erreur lors du signalement du post',
      error: error.message
    });
  }
};

// Save a post
exports.savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }

    const postIndex = user.savedPosts.indexOf(post._id);
    let message;

    if (postIndex === -1) {
      // Save post
      user.savedPosts.push(post._id);
      message = 'Post sauvegardé avec succès';
    } else {
      // Unsave post
      user.savedPosts.splice(postIndex, 1);
      message = 'Post retiré des sauvegardes';
    }

    await user.save();

    res.status(200).json({
      message,
      isSaved: postIndex === -1,
      savedPosts: user.savedPosts
    });
  } catch (error) {
    console.error('Erreur de sauvegarde du post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la sauvegarde du post',
      error: error.message
    });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const filter = { 
      author: id,
      isDeleted: false 
    };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName profilePicture role')
      .populate({
        path: 'comments.user',
        select: 'username firstName lastName profilePicture role'
      })
      .populate({
        path: 'comments.replies.user',
        select: 'username firstName lastName profilePicture role'
      })
      .lean() || [];

    const total = await Post.countDocuments(filter);

    // Initialize default values if user is not authenticated
    let savedPosts = [];
    let userId = null;

    // Only try to get user data if authenticated
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id).select('savedPosts').lean();
      savedPosts = user?.savedPosts || [];
      userId = req.user._id;
    }

    // Add counts and flags to each post with null checks
    const postsWithCounts = (posts || []).map(post => ({
      ...post,
      upvotes: post?.upvotes || [],
      downvotes: post?.downvotes || [],
      comments: post?.comments || [],
      upvoteCount: post?.upvotes?.length || 0,
      downvoteCount: post?.downvotes?.length || 0,
      commentCount: post?.comments?.length || 0,
      hasUpvoted: userId ? (post?.upvotes || []).some(upvoteId => upvoteId?.toString() === userId?.toString()) : false,
      hasDownvoted: userId ? (post?.downvotes || []).some(downvoteId => downvoteId?.toString() === userId?.toString()) : false,
      isSaved: userId ? (savedPosts || []).some(savedId => savedId?.toString() === post?._id?.toString()) : false
    }));

    return res.status(200).json({
      posts: postsWithCounts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur de récupération des posts:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des posts',
      error: error.message
    });
  }
};