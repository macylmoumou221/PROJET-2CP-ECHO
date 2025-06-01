const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Helper function to create JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Helper function to send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    let info = await transporter.sendMail({
      from: '"ECHO Platform" <noreply@echo.com>',
      to: email,
      subject: "Bienvenue sur ECHO!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3ddc97; text-align: center;">Bienvenue sur ECHO!</h2>
          <p>Cher(e) ${username},</p>
          <p>Nous sommes ravis de vous accueillir sur ECHO, votre nouvelle plateforme sociale dédiée à la communauté ESTIN.</p>
          <p>Sur ECHO, vous pourrez :</p>
          <ul style="color: #555;">
            <li>Partager vos idées et expériences</li>
            <li>Interagir avec vos camarades et enseignants</li>
            <li>Rester informé des actualités de l'école</li>
            <li>Participer à des discussions enrichissantes</li>
          </ul>
          <p>N'hésitez pas à explorer la plateforme et à commencer à interagir avec la communauté!</p>
          <p>Cordialement,<br>L'équipe ECHO</p>
        </div>
      `
    });
    
    console.log("Email de bienvenue envoyé: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur d'envoi d'email de bienvenue:", error);
    throw error;
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
    
    let info = await transporter.sendMail({
      from: '"ECHO Platform" <noreply@echo.com>',
      to: email,
      subject: "Vérification de votre adresse email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3ddc97; text-align: center;">Vérifiez votre email</h2>
          <p>Pour activer votre compte ECHO, veuillez cliquer sur le lien ci-dessous:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3ddc97; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Vérifier mon adresse email
            </a>
          </div>
          <p>Si vous n'avez pas demandé ce compte, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe ECHO</p>
        </div>
      `
    });
    
    console.log("Email envoyé: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
    throw error;
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Aucun compte trouvé avec cet email'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Cet email est déjà vérifié'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message: 'Email de vérification renvoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur de renvoi d\'email de vérification:', error);
    res.status(500).json({
      message: 'Erreur lors du renvoi de l\'email de vérification',
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        message: 'Token de vérification manquant' 
      });
    }
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Token de vérification invalide' 
      });
    }
    
    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email after verification
    await sendWelcomeEmail(user.email, user.username);
    
    // Generate JWT token for automatic login
    const authToken = generateToken(user._id);
    
    // Redirect to frontend with success message and token
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true&token=${authToken}`);
  } catch (error) {
    console.error('Erreur de vérification d\'email:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=verification_failed`);
  }
};

// Register user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données de formulaire invalides', 
      errors: errors.array() 
    });
  }
  
  const { email, password, username, firstName, lastName } = req.body;
  
  try {
    // Fonction pour restreindre l'accès aux étudiants de ESTIN SEULEMENT
    if (!email.endsWith('@estin.dz')) {
      return res.status(400).json({ 
        message: 'Seules les adresses email @estin.dz sont autorisées' 
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Cet email est déjà utilisé' 
          : 'Ce nom d\'utilisateur est déjà utilisé' 
      });
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Determine role based on email format
    const emailPrefix = email.split('@')[0];
    const role = emailPrefix.includes('_') ? 'student' : 'teacher';
    
    // Create user
    const user = await User.create({
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      verificationToken
    });
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.'
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Données de formulaire invalides', 
      errors: errors.array() 
    });
  }
  
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Check if user's email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Veuillez vérifier votre email avant de vous connecter' 
      });
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.' 
      });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    res.status(200).json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      group: user.group,
      promotion: user.promotion,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Aucun compte n\'est associé à cet email' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiry on user model
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: '"ECHO Platform" <noreply@echo.com>',
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3ddc97; text-align: center;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3ddc97; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email et votre mot de passe restera inchangé.</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Cordialement,<br>L'équipe ECHO</p>
        </div>
      `
    });
    
    res.status(200).json({
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error) {
    console.error('Erreur de mot de passe oublié:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    
    // Find user with valid reset token and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Token de réinitialisation invalide ou expiré' 
      });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur de réinitialisation de mot de passe:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

// Logout user (simply invalidate the token on client side)
exports.logout = async (req, res) => {
  res.status(200).json({
    message: 'Déconnexion réussie'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur de récupération de l\'utilisateur courant:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des informations utilisateur',
      error: error.message
    });
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/api/auth/error');
    }
    
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:5173/api/auth/success?token=${token}`);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect('/api/auth/error');
  }
};

// Google Sign-In
exports.googleSignIn = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      user.isGoogleAuth = true;
      await user.save();
    } else {
      // Create new user if not exists
      user = new User({
        email,
        isGoogleAuth: true,
        username: email.split('@')[0], // Default username from email
        firstName: '',
        lastName: '',
        role: 'student', // Default role
        password: crypto.randomBytes(8).toString('hex'), // Random password
        verificationToken: crypto.randomBytes(20).toString('hex'), // Verification token
        isEmailVerified: true // Automatically verify email
      });
      await user.save();
    }

    // Generate token and respond
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion Google:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la connexion avec Google',
      error: error.message 
    });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify token...
    
    const user = await User.findOne({ email: googleUser.email });
    
    if (user) {
      // Update existing user
      user.isGoogleAuth = true;
      await user.save();
      // Create JWT token...
    } else {
      // Create new user
      const newUser = new User({
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        isGoogleAuth: true,
        // ...other fields
      });
      await newUser.save();
      // Create JWT token...
    }
    
    // ...rest of the function
  } catch (error) {
    // ...error handling
  }
};

// Get user profile (Me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();

    res.status(200).json(user); // isGoogleAuth will be included automatically
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      message: 'Error retrieving user profile',
      error: error.message 
    });
  }
};

// Make sendWelcomeEmail available for other modules
exports.sendWelcomeEmail = sendWelcomeEmail;