const Event = require('../models/event.model');

// Create event (admin only)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, type, visibility, targetGroups, targetPromotions } = req.body;
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time.start) || !timeRegex.test(time.end)) {
      return res.status(400).json({
        message: 'Format de l\'heure invalide. Utilisez le format HH:mm'
      });
    }
    
    const event = await Event.create({
      title,
      description,
      date,
      time,
      type,
      visibility,
      creator: req.user._id,
      targetGroups,
      targetPromotions
    });
    
    res.status(201).json({
      message: 'Événement créé avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur de création d\'événement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
};

// Get events with filters
exports.getEvents = async (req, res) => {
  try {
    const { year, month, type } = req.query;
    
    // Build filter
    const filter = {};
    
    // Date filter for specific month and year
    if (year && month) {
      const startDate = new Date(year, month - 1, 1); // Month is 0-based
      const endDate = new Date(year, month, 0); // Get last day of month
      
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Type filter
    if (type) {
      filter.type = type;
    }
    
    // Visibility filter based on user role
    filter.$or = [
      { visibility: 'all' },
      { visibility: req.user.role }
    ];
    
    // Group and promotion filter for students
    if (req.user.role === 'student') {
      if (req.user.group) {
        filter.$or.push({ targetGroups: req.user.group });
      }
      if (req.user.promotion) {
        filter.$or.push({ targetPromotions: req.user.promotion });
      }
    }
    
    const events = await Event.find(filter)
      .sort({ date: 1, 'time.start': 1 })
      .populate('creator', 'username');
    
    // Format events for calendar
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      type: event.type,
      creator: event.creator.username
    }));
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error('Erreur de récupération des événements:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des événements',
      error: error.message
    });
  }
};

// Update event (admin only)
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    
    // Validate time format if provided
    if (updates.time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.time.start) || !timeRegex.test(updates.time.end)) {
        return res.status(400).json({
          message: 'Format de l\'heure invalide. Utilisez le format HH:mm'
        });
      }
    }
    
    const event = await Event.findByIdAndUpdate(
      eventId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ 
        message: 'Événement non trouvé' 
      });
    }
    
    res.status(200).json({
      message: 'Événement mis à jour avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur de mise à jour d\'événement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'événement',
      error: error.message
    });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByIdAndDelete(eventId);
    
    if (!event) {
      return res.status(404).json({ 
        message: 'Événement non trouvé' 
      });
    }
    
    res.status(200).json({
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur de suppression d\'événement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'événement',
      error: error.message
    });
  }
};