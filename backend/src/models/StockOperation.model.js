import mongoose from 'mongoose';

const stockOperationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, "L'ID du produit est requis"],
    },
    type: {
      type: String,
      enum: ['IN', 'OUT'],
      required: [true, 'Le type est requis'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [1, 'La quantité doit être supérieure à 0'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

stockOperationSchema.index({ productId: 1, date: -1 });
stockOperationSchema.index({ userId: 1 });
stockOperationSchema.index({ date: -1 });

const StockOperation = mongoose.model('StockOperation', stockOperationSchema);

export default StockOperation;


