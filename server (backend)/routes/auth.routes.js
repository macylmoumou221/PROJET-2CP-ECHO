const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/error',
    session: false
  }),
  authController.googleCallback
);

// Success route
router.get('/success', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token not provided' });
  }
  res.json({ token, message: 'Authentication successful' });
});

// Error route
router.get('/error', (req, res) => {
  res.status(401).json({ message: 'Authentication failed' });
});

// Register
router.post(
  '/register',
  [
    check('email', 'Veuillez fournir un email valide').isEmail(),
    check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
    check('username', 'Le nom d\'utilisateur est requis').not().isEmpty(),
    check('firstName', 'Le prénom est requis').not().isEmpty(),
    check('lastName', 'Le nom est requis').not().isEmpty()
  ],
  authController.register
);

// Resend verification email
router.post(
  '/resend-verification',
  [
    check('email', 'Veuillez fournir un email valide').isEmail()
  ],
  authController.resendVerification
);

// Verify email
router.get('/verify-email', authController.verifyEmail);

// Login
router.post(
  '/login',
  [
    check('email', 'Veuillez fournir un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  authController.login
);

// Forgot password
router.post(
  '/forgot-password',
  [
    check('email', 'Veuillez fournir un email valide').isEmail()
  ],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    check('password', 'Le nouveau mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
  ],
  authController.resetPassword
);

// Logout
router.post('/logout', protect, authController.logout);

// Get current user
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;