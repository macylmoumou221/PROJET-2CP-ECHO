const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  let token;
  
  //Vérifier si le token est dans l'en-tête d'autorisation
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      message: 'Accès non autorisé. Veuillez vous connecter.' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé. Token invalide.' 
      });
    }
    
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Veuillez vérifier votre email avant de continuer.' 
      });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.' 
      });
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token invalide ou expiré.' 
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};