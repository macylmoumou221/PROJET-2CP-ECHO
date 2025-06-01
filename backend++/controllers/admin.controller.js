const User = require('../models/user.model');
const Post = require('../models/post.model');
const Claim = require('../models/claim.model');
const LostFound = require('../models/lostFound.model');
const Notification = require('../models/notification.model');
const fs = require('fs');
const path = require('path');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, group, promotion } = req.query;
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
    console.error('Erreur de récupération des utilisateurs par l\'admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, role, group, promotion, isBanned } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Update fields
    if (username) user.username = username;
    if (role) user.role = role;
    if (group !== undefined) user.group = group;
    if (promotion !== undefined) user.promotion = promotion;
    if (isBanned !== undefined) user.isBanned = isBanned;
    
    await user.save();
    
    // Notify user if they were banned
    if (isBanned === true && !user.isBanned) {
      await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'admin',
        content: 'a suspendu votre compte'
      });
    }
    
    // Notify user if they were unbanned
    if (isBanned === false && user.isBanned) {
      await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'admin',
        content: 'a réactivé votre compte'
      });
    }
    
    res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        group: user.group,
        promotion: user.promotion,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('Erreur de mise à jour d\'utilisateur par l\'admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Delete user profile picture if it exists
    if (user.profilePicture && !user.profilePicture.startsWith('http')) {
      const picPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(picPath)) {
        fs.unlinkSync(picPath);
      }
    }
    
    // Soft delete user posts
    await Post.updateMany({ author: userId }, { isDeleted: true });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression d\'utilisateur par l\'admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// Get reported posts
exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 
      'reports.0': { $exists: true },
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture role')
      .populate('reports.user', 'username')
      .lean();
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Erreur de récupération des posts signalés:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des posts signalés',
      error: error.message
    });
  }
};

// Moderate a post (remove or keep)
exports.moderatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { action, notifyUser } = req.body; // action: 'remove' or 'keep'
    
    const post = await Post.findById(postId).populate('author', 'username');
    
    if (!post) {
      return res.status(404).json({ 
        message: 'Post non trouvé' 
      });
    }
    
    if (action === 'remove') {
      // Mark post as deleted
      post.isDeleted = true;
      await post.save();
      
      // Notify user if requested
      if (notifyUser) {
        await Notification.create({
          recipient: post.author._id,
          sender: req.user._id,
          type: 'admin',
          content: `a supprimé votre post "${post.title}"`,
          relatedId: post._id,
          onModel: 'Post'
        });
      }
      
      res.status(200).json({
        message: 'Post supprimé avec succès'
      });
    } else if (action === 'keep') {
      // Clear reports
      post.reports = [];
      await post.save();
      
      res.status(200).json({
        message: 'Post conservé et signalements supprimés'
      });
    } else {
      return res.status(400).json({ 
        message: 'Action invalide. Utilisez "remove" ou "keep".' 
      });
    }
  } catch (error) {
    console.error('Erreur de modération de post:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la modération du post',
      error: error.message
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Active users (users who have a verified email)
    const activeUsers = await User.countDocuments({ isEmailVerified: true, isBanned: false });
    
    // Posts created today
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: today },
      isDeleted: false
    });
    
    // Claims created today
    const claimsToday = await Claim.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Lost & found items reported today
    const lostFoundToday = await LostFound.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Users registered today
    const usersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments({ isDeleted: false });
    const totalClaims = await Claim.countDocuments();
    const totalLostFound = await LostFound.countDocuments();
    
    // Role distribution
    const students = await User.countDocuments({ role: 'student' });
    const teachers = await User.countDocuments({ role: 'teacher' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    res.status(200).json({
      today: {
        posts: postsToday,
        claims: claimsToday,
        lostFound: lostFoundToday,
        users: usersToday
      },
      total: {
        users: totalUsers,
        posts: totalPosts,
        claims: totalClaims,
        lostFound: totalLostFound
      },
      activeUsers,
      roles: {
        students,
        teachers,
        admins
      }
    });
  } catch (error) {
    console.error('Erreur de récupération des statistiques du tableau de bord:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Send global notification
exports.sendGlobalNotification = async (req, res) => {
  try {
    const { title, content, targetRole } = req.body;
    
    // Find target users
    let targetUsers;
    if (targetRole && targetRole !== 'all') {
      targetUsers = await User.find({ role: targetRole }).select('_id');
    } else {
      targetUsers = await User.find().select('_id');
    }
    
    // Create notifications for each user
    const notifications = targetUsers.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'admin',
      content: title + ': ' + content
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(200).json({
      message: 'Notification globale envoyée avec succès',
      recipients: targetUsers.length
    });
  } catch (error) {
    console.error('Erreur d\'envoi de notification globale:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi de la notification globale',
      error: error.message
    });
  }
};

// Moderate lost and found items
exports.moderateLostFound = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { action } = req.body; // action: 'remove' or 'keep'
    
    const item = await LostFound.findById(itemId).populate('reporter', 'username');
    
    if (!item) {
      return res.status(404).json({ 
        message: 'Objet non trouvé' 
      });
    }
    
    if (action === 'remove') {
      // Delete the image if it exists
      if (item.image && !item.image.startsWith('http')) {
        const imagePath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete the item
      await LostFound.findByIdAndDelete(itemId);
      
      // Notify user
      await Notification.create({
        recipient: item.reporter._id,
        sender: req.user._id,
        type: 'admin',
        content: `a supprimé votre annonce d'objet "${item.name}"`
      });
      
      res.status(200).json({
        message: 'Objet supprimé avec succès'
      });
    } else if (action === 'keep') {
      res.status(200).json({
        message: 'Objet conservé'
      });
    } else {
      return res.status(400).json({ 
        message: 'Action invalide. Utilisez "remove" ou "keep".' 
      });
    }
  } catch (error) {
    console.error('Erreur de modération d\'objet perdu/trouvé:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la modération de l\'objet',
      error: error.message
    });
  }
};