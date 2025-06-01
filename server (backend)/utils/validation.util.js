const { validationResult } = require('express-validator');

// Middleware to validate request
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données de formulaire invalides', 
      errors: errors.array() 
    });
  }
  next();
};

// Validate email is from @estin.dz domain
exports.validateEstinEmail = (email) => {
  if (!email.endsWith('@estin.dz')) {
    throw new Error('Seules les adresses email @estin.dz sont autorisées');
  }
  return true;
};

// Parse student or teacher from email
exports.parseUserFromEmail = (email) => {
  if (!email.endsWith('@estin.dz')) {
    return null;
  }
  
  const emailPrefix = email.split('@')[0];
  
  if (emailPrefix.includes('_')) {  // Student format: m_moumou@estin.dz
    const parts = emailPrefix.split('_');
    return {
      role: 'student',
      firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase(),
      lastName: parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase()
    };
  } else {  // Teacher format: smith@estin.dz
    return {
      role: 'teacher',
      firstName: '',  // Teachers need to set this manually
      lastName: emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase()
    };
  }
};