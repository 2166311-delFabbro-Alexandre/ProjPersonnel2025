const multer = require("multer");
const { storage } = require("..//utils/cloudinary");

/**
 * Configuration de Multer pour le téléchargement d'images
 * @param {string} folderName - Le dossier dans lequel télécharger l'image
 * @returns {function} - Le middleware Multer configuré
 */
const uploadImage = (folderName) => {
    const upload = multer({
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

    return upload.single('image');
};

module.exports = uploadImage;