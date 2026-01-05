import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, 'La référence est requise'],
      unique: true,
      trim: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif'],
    },
    quantite: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [0, 'La quantité doit être positive'],
      default: 0,
    },
    quantiteInitiale: {
      type: Number,
      min: [0, 'La quantité initiale doit être positive'],
      default: 0,
    },
    seuilMin: {
      type: Number,
      required: [true, 'Le seuil minimum est requis'],
      min: [0, 'Le seuil minimum doit être positif'],
      default: 10,
    },
    type: {
      type: String,
      default: 'Standard',
    },
    status: {
      type: String,
      enum: ['active', 'finished'],
      default: 'active',
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

// productSchema.index({ reference: 1 }); // Removed duplicate index
productSchema.index({ nom: 1 });

// Virtual for low stock alert
productSchema.virtual('isLowStock').get(function () {
  return this.quantite <= this.seuilMin;
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;


