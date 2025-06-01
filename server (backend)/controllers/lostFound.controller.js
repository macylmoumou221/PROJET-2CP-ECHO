const LostFound = require('../models/lostFound.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// Create a lost or found item report
exports.createItem = async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        message: 'Seuls les étudiants peuvent signaler des objets perdus ou trouvés' 
      });
    }
    
    const { name, description, type, location } = req.body;
    
    // Create the item
    const item = new LostFound({
      reporter: req.user._id,
      name,
      description,
      type, // 'lost' or 'found'
      location
    });
    
    // Handle image upload
    if (req.file) {
      item.image = `${process.env.FRONTEND_URL}/uploads/lostfound/${req.file.filename}`;
    }
    
    await item.save();
    
    res.status(201).json({
      message: 'Objet signalé avec succès',
      item
    });
  } catch (error) {
    console.error('Erreur de création d\'objet perdu/trouvé:', error);
    res.status(500).json({ 
      message: 'Erreur lors du signalement de l\'objet',
      error: error.message
    });
  }
};

// Get all lost and found items
exports.getItems = async (req, res) => {
  try {
    const items = await LostFound.find()
      .sort({ createdAt: -1 })
      .populate('reporter', 'username firstName lastName profilePicture')
      .lean();
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erreur de récupération des objets:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des objets',
      error: error.message
    });
  }
};

// Get my reported items
exports.getMyItems = async (req, res) => {
  try {
    const items = await LostFound.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Erreur de récupération de mes objets:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de vos objets',
      error: error.message
    });
  }
};

// Get a specific item
exports.getItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.itemId)
      .populate('reporter', 'username firstName lastName profilePicture')
      .lean();
    
    if (!item) {
      return res.status(404).json({ 
        message: 'Objet non trouvé' 
      });
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Erreur de récupération d\'objet:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'objet',
      error: error.message
    });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const item = await LostFound.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ 
        message: 'Objet non trouvé' 
      });
    }
    
    // Check if user is the reporter
    if (item.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à modifier cet objet' 
      });
    }
    
    item.status = status;
    await item.save();
    
    res.status(200).json({
      message: 'Statut mis à jour avec succès',
      item
    });
  } catch (error) {
    console.error('Erreur de mise à jour de statut:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// Delete an item report
exports.deleteItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ 
        message: 'Objet non trouvé' 
      });
    }
    
    // Check if user is the reporter or an admin
    if (item.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cet objet' 
      });
    }
    
    // Delete image if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image.replace(process.env.FRONTEND_URL, ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await LostFound.findByIdAndDelete(req.params.itemId);
    
    res.status(200).json({
      message: 'Objet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression d\'objet:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'objet',
      error: error.message
    });
  }
};