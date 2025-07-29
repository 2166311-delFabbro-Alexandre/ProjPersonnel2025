const multer = require("multer");
const { storage } = require("../cloudinary");

/**
 * Configuration de Multer pour le téléchargement d'images
 */
const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // limite à 5MB
    },
    fileFilter: (req, file, cb) => {
        // Accepter seulement les images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont acceptées'), false);
        }
    }
});

module.exports = uploadMiddleware;