const mongoose = require('mongoose');

/**
 * Modèle de données pour les produits
 * Utilisé pour stocker les informations des produits dans la base de données
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: { type: String, required: false },
  images: [{
    url: String,
    isMain: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  inStock: { type: Boolean, default: true },
  isUnique: { type: Boolean, default: false },
  stockQuantity: { type: Number, default: null },
}, {
  timestamps: true, // ajoute createdAt et updatedAt
});

// Propriété virtuelle pour obtenir l'URL de l'image principale
productSchema.virtual('mainImageUrl').get(function () {
  // Retourne l'URL de l'image principale si elle existe
  const mainImage = this.images.find(img => img.isMain);
  if (mainImage) return mainImage.url;

  // Sinon, retourne la première image ou l'URL de l'image principale
  if (this.images.length > 0) return this.images[0].url;

  // Si aucune image n'est définie, retourne l'URL legacy
  return this.imageUrl || null;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
