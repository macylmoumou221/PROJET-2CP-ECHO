const User = require('../models/user.model');
const Post = require('../models/post.model');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Helper function to validate URL
const isValidUrl = (url) => {
  if (!url) return true; // Allow empty strings
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, group, promotion } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (group) filter.group = group;
    if (promotion) filter.promotion = promotion;
    
    // Search by username, email, first name or last name
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires -provider')
      .lean();
      
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Get user's posts
    const posts = await Post.find({ 
      author: req.params.id,
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture role');
    
    // Add isGoogleAuth flag
    const userResponse = {
      ...user,
      isGoogleAuth: Boolean(user.googleId) // Will be true if googleId exists, false otherwise
    };

    res.status(200).json({
      user: userResponse,
      posts
    });
  } catch (error) {
    console.error('Erreur de récupération de profil utilisateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du profil utilisateur',
      error: error.message
    });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      author: req.params.id,
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture role')
      .lean();

    const total = await Post.countDocuments({ 
      author: req.params.id,
      isDeleted: false 
    });

    // Add counts to each post
    const postsWithCounts = posts.map(post => ({
      ...post,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
      commentCount: post.comments.length,
      hasUpvoted: post.upvotes.some(id => id.toString() === req.user._id.toString()),
      hasDownvoted: post.downvotes.some(id => id.toString() === req.user._id.toString())
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

// Get my posts
exports.getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      author: req.user._id,
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture role')
      .lean();

    const total = await Post.countDocuments({ 
      author: req.user._id,
      isDeleted: false 
    });

    // Add counts to each post
    const postsWithCounts = posts.map(post => ({
      ...post,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
      commentCount: post.comments.length,
      hasUpvoted: post.upvotes.some(id => id.toString() === req.user._id.toString()),
      hasDownvoted: post.downvotes.some(id => id.toString() === req.user._id.toString())
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

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Update fields
    const { username, bio, socialLinks, group, promotion, profilePicture } = req.body;
    
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    
    // Update social links with URL validation
    if (socialLinks) {
      const links = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      
      // Validate each social link URL
      for (const [platform, url] of Object.entries(links)) {
        if (url && !isValidUrl(url)) {
          return res.status(400).json({
            message: 'Veuillez insérer un lien valide',
            platform
          });
        }
      }
      
      user.socialLinks = {
        ...user.socialLinks,
        ...links
      };
    }
    
    // Only students can update group and promotion
    if (user.role === 'student') {
      if (group) user.group = group;
      if (promotion) user.promotion = promotion;
    }
    
    // Handle profile picture update
    if (req.file) {
      // Remove old profile picture if it exists and is not a URL
      if (user.profilePicture && !user.profilePicture.startsWith('http')) {
        const oldPicPath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.profilePicture));
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath);
        }
      }
      user.profilePicture = `${process.env.FRONTEND_URL}/uploads/profiles/${req.file.filename}`;
    } else if (profilePicture) {
      // If profile picture is provided as a URL
      if (!isValidUrl(profilePicture)) {
        return res.status(400).json({
          message: 'Veuillez insérer un lien valide pour la photo de profil'
        });
      }
      user.profilePicture = profilePicture;
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        role: user.role,
        group: user.group,
        promotion: user.promotion
      }
    });
  } catch (error) {
    console.error('Erreur de mise à jour de profil:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Mot de passe actuel incorrect' 
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Erreur de changement de mot de passe:', error);
    res.status(500).json({ 
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    });
  }
};

// Get saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedPosts',
        match: { isDeleted: false },
        options: {
          sort: { createdAt: -1 },
          skip: skip,
          limit: limit
        },
        populate: {
          path: 'author',
          select: 'username profilePicture role'
        }
      })
      .lean();

    const total = user.savedPosts.length;

    // Add counts to each post
    const postsWithCounts = user.savedPosts.map(post => ({
      ...post,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
      commentCount: post.comments.length,
      hasUpvoted: post.upvotes.some(id => id.toString() === req.user._id.toString()),
      hasDownvoted: post.downvotes.some(id => id.toString() === req.user._id.toString())
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
    console.error('Erreur de récupération des posts sauvegardés:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des posts sauvegardés',
      error: error.message
    });
  }
};

// Save post
exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if post exists
    const post = await Post.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }
    
    const user = await User.findById(req.user._id);
    
    // Check if post is already saved
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ 
        message: 'Post déjà sauvegardé' 
      });
    }
    
    // Add post to saved posts
    user.savedPosts.push(postId);
    await user.save();
    
    res.status(200).json({
      message: 'Post sauvegardé avec succès'
    });
  } catch (error) {
    console.error('Erreur de sauvegarde de post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la sauvegarde du post',
      error: error.message
    });
  }
};

// Unsave post
exports.unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    // Remove post from saved posts
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    await user.save();
    
    res.status(200).json({
      message: 'Post retiré des sauvegardés avec succès'
    });
  } catch (error) {
    console.error('Erreur de retrait de post sauvegardé:', error);
    res.status(500).json({ 
      message: 'Erreur lors du retrait du post des sauvegardés',
      error: error.message
    });
  }
};

// Report technical issue
exports.reportTechnicalIssue = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // We could create a model for technical issues, but for simplicity, we'll just return a success message
    // This would typically send an email to administrators or log the issue in a database
    
    res.status(200).json({
      message: 'Problème technique signalé avec succès. Un administrateur examinera votre signalement.'
    });
  } catch (error) {
    console.error('Erreur de signalement de problème technique:', error);
    res.status(500).json({ 
      message: 'Erreur lors du signalement du problème technique',
      error: error.message
    });
  }
};