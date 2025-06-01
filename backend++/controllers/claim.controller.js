const Claim = require('../models/claim.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Student: Create a claim
exports.createClaim = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role === 'teacher') {
      return res.status(403).json({ 
        message: 'Les enseignants ne peuvent pas créer de réclamations' 
      });
    }

    // Check daily claim limit
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    const claimsToday = await Claim.countDocuments({
      student: req.user._id,
      createdAt: { $gte: startOfDay }
    });

    if (claimsToday >= 3) {
      return res.status(400).json({
        message: 'Limite de réclamations atteinte pour aujourd\'hui (maximum 3 par jour)'
      });
    }

    console.log('Request body:', req.body); // Debug log
    const { teacher, title, details } = req.body;

    // Create new claim
    const claim = new Claim({
      student: req.user._id,
      teacher,
      title,
      details
    });

    console.log('Claim before save:', claim); // Debug log
    await claim.save();

    res.status(201).json({
      message: 'Réclamation créée avec succès',
      claim
    });
  } catch (error) {
    console.error('Claim creation error:', error); // Detailed error logging
    res.status(500).json({
      message: 'Erreur lors de la création de la réclamation',
      error: error.message
    });
  }
};

// Student: Get my claims
exports.getMyClaims = async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        message: 'Seuls les étudiants peuvent voir leurs réclamations' 
      });
    }
    
    const claims = await Claim.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'teacher',
        select: 'username firstName lastName profilePicture'
      })
      .populate({
        path: 'student',
        select: 'username firstName lastName profilePicture'
      })
      .lean();
    
    res.status(200).json(claims);
  } catch (error) {
    console.error('Erreur de récupération des réclamations:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des réclamations',
      error: error.message
    });
  }
};

// Teacher: Get claims addressed to me
exports.getClaimsForTeacher = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        message: 'Seuls les enseignants peuvent voir les réclamations qui leur sont adressées' 
      });
    }
    
    const claims = await Claim.find({ teacher: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'student',
        select: 'username firstName lastName profilePicture'
      })
      .populate({
        path: 'teacher',
        select: 'username firstName lastName profilePicture'
      })
      .lean();
    
    res.status(200).json(claims);
  } catch (error) {
    console.error('Erreur de récupération des réclamations pour l\'enseignant:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des réclamations',
      error: error.message
    });
  }
};

// Teacher: Respond to a claim
exports.respondToClaim = async (req, res) => {
  try {
    const { response, status } = req.body;
    const claim = await Claim.findById(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Réclamation non trouvée' });
    }

    if (claim.isResponded) {
      return res.status(400).json({ 
        message: 'Cette réclamation a déjà reçu une réponse' 
      });
    }

    // Update claim
    claim.response = response;
    claim.status = status;
    claim.isResponded = true;

    // Create notification before saving claim to ensure both operations succeed
    const notification = await Notification.create({
      recipient: claim.student,
      sender: req.user._id,
      type: 'claim',
      content: `Votre réclamation "${claim.title}" a été ${status === 'dealt' ? 'traitée' : 'rejetée'}`,
      relatedId: claim._id,
      onModel: 'Claim'
    });

    // Save claim after notification is created
    await claim.save();

    res.status(200).json({
      message: 'Réponse envoyée avec succès',
      claim,
      notification
    });

  } catch (error) {
    console.error('Error in respondToClaim:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi de la réponse',
      error: error.message
    });
  }
};

// Get a specific claim
exports.getClaim = async (req, res) => {
  try {
    const { claimId } = req.params;
    
    const claim = await Claim.findById(claimId)
      .populate('student', 'username firstName lastName profilePicture')
      .populate('teacher', 'username firstName lastName profilePicture')
      .lean();
    
    if (!claim) {
      return res.status(404).json({ 
        message: 'Réclamation non trouvée' 
      });
    }
    
    // Check if user is authorized to view this claim
    if (
      claim.student._id.toString() !== req.user._id.toString() && 
      claim.teacher._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à voir cette réclamation' 
      });
    }
    
    res.status(200).json(claim);
  } catch (error) {
    console.error('Erreur de récupération de réclamation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la réclamation',
      error: error.message
    });
  }
};