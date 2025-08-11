const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['Student', 'Teacher'];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    // Stored full display name; auto-derived from first/last if not provided
    name: {
      type: String,
      trim: true,
      maxlength: 210, // accommodates first + last + space
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: /[^\s@]+@[^\s@]+\.[^\s@]+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: VALID_ROLES,
      default: 'Student',
      index: true,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    google: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure full name is populated
userSchema.pre('validate', function populateFullName(next) {
  if (!this.name) {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    if (parts.length > 0) {
      this.name = parts.join(' ').replace(/\s+/g, ' ').trim();
    }
  }
  next();
});

// Hash password when modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare plaintext password with hashed password
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive/internal fields when converting to JSON
userSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);