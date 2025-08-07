const mongoose = require('mongoose');

/**
 * Schéma pour le contenu des pages.
 * Chaque document représente le contenu d'une page spécifique.
 */
const pageContentSchema = new mongoose.Schema({
    pageId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PageContent', pageContentSchema);