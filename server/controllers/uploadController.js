/**
 * Controller pour gérer les téléchargements d'images vers Cloudinary
 * @module controllers/uploadController
 */

/**
 * Télécharge une image vers Cloudinary
 * @param {Object} req - La requête Express
 * @param {Object} res - La réponse Express
 */
exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier téléchargé" });
        }

        // Multer avec CloudinaryStorage a déjà téléchargé l'image
        // et a placé l'URL dans req.file.path
        res.json({ imageUrl: req.file.path });
        console.log("Image uploaded:", req.file.path);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: "Erreur lors du téléchargement de l'image",
            error: error.message
        });
    }
};

/**
 * Supprime une image de Cloudinary
 * Non implémenté pour le moment, mais pourrait être ajouté plus tard
 */
exports.deleteImage = (req, res) => {
    // Cette fonctionnalité pourrait être implémentée pour supprimer des images de Cloudinary
    // lorsqu'un produit est supprimé ou qu'une image est remplacée
    res.status(501).json({ message: "Non implémenté" });
};