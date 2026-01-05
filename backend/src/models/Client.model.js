import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
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
    contact: {
      type: String,
      required: [true, 'Le contact est requis'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    adresse: {
      type: String,
      trim: true,
    },
    credit: {
      type: Number,
      default: 0,
    },
    history: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: Number,
        type: {
          type: String,
          enum: ['payment', 'credit_update'],
        },
        note: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ email: 1 });
clientSchema.index({ nom: 1, prenom: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;


