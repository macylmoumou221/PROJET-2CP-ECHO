const Announcement = require('../models/announcement.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Create announcement (teachers only)
exports.createAnnouncement = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        message: 'Seuls les enseignants peuvent créer des annonces' 
      });
    }
    
    const { title, content, targetGroups, targetPromotions } = req.body;
    
    // Create announcement
    const announcement = await Announcement.create({
      teacher: req.user._id,
      title,
      content,
      targetGroups,
      targetPromotions
    });
    
    // Find all students in target groups and promotions
    const targetStudents = await User.find({
      role: 'student',
      $or: [
        { group: { $in: targetGroups } },
        { promotion: { $in: targetPromotions } }
      ]
    });
    
    // Create notifications for target students
    const notifications = targetStudents.map(student => ({
      recipient: student._id,
      sender: req.user._id,
      type: 'announcement',
      content: `Nouvelle annonce: ${title}`,
      relatedId: announcement._id,
      onModel: 'Announcement'
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      message: 'Annonce créée avec succès',
      announcement
    });
  } catch (error) {
    console.error('Erreur de création d\'annonce:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'annonce',
      error: error.message
    });
  }
};

// Get announcements for current user
exports.getAnnouncements = async (req, res) => {
  try {
    let announcements;
    
    if (req.user.role === 'teacher') {
      // Teachers see their own announcements
      announcements = await Announcement.find({ teacher: req.user._id })
        .sort({ createdAt: -1 })
        .populate('teacher', 'username')
        .lean();
    } else {
      // Students see announcements targeted to both their group AND promotion
      announcements = await Announcement.find({
        $and: [
          { targetGroups: req.user.group },
          { targetPromotions: req.user.promotion }
        ]
      })
        .sort({ createdAt: -1 })
        .populate('teacher', 'username')
        .lean();
    }
    
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Erreur de récupération des annonces:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des annonces',
      error: error.message
    });
  }
};

// Delete announcement (teacher can only delete their own)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        message: 'Annonce non trouvée' 
      });
    }
    
    // Check if user is the teacher who created the announcement
    if (announcement.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cette annonce' 
      });
    }
    
    await Announcement.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression d\'annonce:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'annonce',
      error: error.message
    });
  }
};