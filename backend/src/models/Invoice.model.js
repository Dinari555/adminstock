import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  qte: {
    type: Number,
    required: true,
    min: 1,
  },
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, "L'ID du client est requis"],
    },
    items: {
      type: [invoiceItemSchema],
      required: [true, 'Les articles sont requis'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'La facture doit contenir au moins un article',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    statut: {
      type: String,
      enum: ['payé', 'en_attente', 'en_retard'],
      default: 'en_attente',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    archivedPdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ clientId: 1, date: -1 });
invoiceSchema.index({ statut: 1 });
invoiceSchema.index({ date: -1 });
invoiceSchema.index({ createdBy: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;


