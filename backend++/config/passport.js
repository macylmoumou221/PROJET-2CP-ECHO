const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../controllers/auth.controller');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract email from Google profile
        const email = profile.emails[0].value;

        // Check if email is from estin.dz domain
        if (!email.endsWith('@estin.dz')) {
          return done(null, false, { message: 'Seules les adresses email @estin.dz sont autorisées' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          return done(null, user);
        }

        // Extract first name and last name from Google profile
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        
        // Determine role based on email format
        const emailPrefix = email.split('@')[0];
        const role = emailPrefix.includes('_') ? 'student' : 'teacher';

        // Generate random number between 100 and 999
        const randomNum = Math.floor(Math.random() * 900) + 100;
        
        // Create username in format firstname_lastname_randomnumber
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${randomNum}`;

        // Generate random password for Google OAuth users
        const randomPassword = crypto.randomBytes(16).toString('hex');

        user = await User.create({
          email,
          password: randomPassword,
          username,
          firstName,
          lastName,
          profilePicture: profile.photos[0].value,
          role,
          isEmailVerified: true // Email is verified by Google
        });

        // Send welcome email for new users
        await sendWelcomeEmail(email, username);

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
module.exports = passport;