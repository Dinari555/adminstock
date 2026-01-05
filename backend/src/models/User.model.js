import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// userSchema.index({ email: 1 }); // Removed duplicate index
userSchema.index({ role: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;


