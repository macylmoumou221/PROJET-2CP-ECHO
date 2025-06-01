const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    github: { type: String, default: '' },
    x: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  group: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        return /^G[1-9]\d*$/.test(v); // Must match format G followed by a number > 0
      },
      message: props => `${props.value} n'est pas un format de groupe valide. Utilisez le format G suivi d'un nombre (ex: G1, G2, etc.)`
    }
  },
  promotion: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        return /^20\d{2}$/.test(v) && parseInt(v) >= 2020 && parseInt(v) <= 2030; // Must be a year between 2020-2030
      },
      message: props => `${props.value} n'est pas une année de promotion valide. Utilisez une année entre 2020 et 2030`
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isBanned: {
    type: Boolean,
    default: false
  },
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isGoogleAuth: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


userSchema.pre('validate', function(next) {
  if (this.isModified('email') && this.email.endsWith('@estin.dz')) {
    const emailPrefix = this.email.split('@')[0];
    
    if (emailPrefix.includes('_')) {   //format d'un email étudiant ex : m_moumou@estin.dz
      const parts = emailPrefix.split('_');
      this.role = 'student';
    } else {  // format d'un email enseignant : allou@estin.dz
      this.lastName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).toLowerCase();
      this.role = 'teacher';
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);