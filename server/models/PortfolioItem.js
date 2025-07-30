const mongoose = require('mongoose');

/**
 * Schéma pour les éléments du portfolio.
 */
const portfolioItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);