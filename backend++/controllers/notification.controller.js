const Notification = require('../models/notification.model');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profilePicture')
      .lean();
    
    const total = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id,
      isRead: false
    });
    
    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur de récupération des notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Check if notification exists and belongs to user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ 
        message: 'Notification non trouvée' 
      });
    }
    
    // Mark as read
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur de marquage de notification comme lue:', error);
    res.status(500).json({ 
      message: 'Erreur lors du marquage de la notification',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Erreur de marquage de toutes les notifications comme lues:', error);
    res.status(500).json({ 
      message: 'Erreur lors du marquage des notifications',
      error: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Check if notification exists and belongs to user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ 
        message: 'Notification non trouvée' 
      });
    }
    
    // Delete notification
    await Notification.findByIdAndDelete(notificationId);
    
    res.status(200).json({
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression de notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la notification',
      error: error.message
    });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    
    res.status(200).json({
      message: 'Toutes les notifications ont été supprimées'
    });
  } catch (error) {
    console.error('Erreur de suppression de toutes les notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression des notifications',
      error: error.message
    });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user._id,
      isRead: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Erreur de récupération du nombre de notifications non lues:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du nombre de notifications non lues',
      error: error.message
    });
  }
};