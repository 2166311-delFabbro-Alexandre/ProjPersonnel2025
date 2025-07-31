const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  inStock: { type: Boolean, default: true },
  isUnique: { type: Boolean, default: false },
  stockQuantity: { type: Number, default: null },
}, {
  timestamps: true, // ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Product', productSchema);
