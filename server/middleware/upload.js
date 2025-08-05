const multer = require("multer");
const { storage } = require("..//utils/cloudinary");

/**
 * Configuration Multer commune pour tous les téléchargements d'images
 * @param {string} folderName - Le dossier dans lequel télécharger l'image
 * @returns {function} - Le middleware Multer configuré
 * 
 * Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 5 août 2025
 */
const getMulterConfig = (folderName) => ({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // limit to 5MB
    },
    fileFilter: (req, file, cb) => {
        // Si un dossier est spécifié dans le corps de la requête, l'utiliser
        file.folder = folderName;
        // Accepter seulement les images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont acceptées'), false);
        }
    }
});

/**
 * Middleware pour télécharger une seule image
 * @param {string} folderName - Le dossier dans lequel télécharger l'image (optionnel)
 * @returns {Function} - Middleware Multer configuré pour une seule image
 */
const uploadSingleImage = (folderName) => {
    return multer(getMulterConfig(folderName)).single('image');
};

/**
 * Middleware pour télécharger plusieurs images
 * @param {string} folderName - Le dossier dans lequel télécharger les images (optionnel)
 * @param {number} maxCount - Nombre maximal d'images à télécharger (défaut: 10)
 * @returns {Function} - Middleware Multer configuré pour plusieurs images
 */
const uploadMultipleImages = (folderName, maxCount = 10) => {
    return multer(getMulterConfig(folderName)).array('images', maxCount);
};

/**
 * Crée un middleware pour télécharger des images dans plusieurs champs
 * @param {string} folderName - Le dossier dans lequel télécharger les images (optionnel)
 * @param {Array} fields - Tableau de configuration des champs
 * @returns {Function} - Middleware Multer configuré pour plusieurs champs
 * 
 * Exemple d'utilisation:
 * uploadFields('products', [
 *   { name: 'thumbnail', maxCount: 1 },
 *   { name: 'gallery', maxCount: 5 }
 * ])
 */
const uploadFields = (folderName, fields) => {
    return multer(getMulterConfig(folderName)).fields(fields);
};

module.exports = {
    single: uploadSingleImage,
    multiple: uploadMultipleImages,
    fields: uploadFields
};