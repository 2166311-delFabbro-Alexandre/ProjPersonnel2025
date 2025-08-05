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

        const folder = req.body.folder || 'products';
        const folderPath = `projet-personnel/${folder}`;

        const imageUrl = req.file.path;

        return res.status(200).json({
            success: true,
            imageUrl: imageUrl,
            message: `Image téléchargée avec succès dans ${folderPath}`
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors du téléchargement de l'image",
            error: error.message
        });
    }
};

exports.uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
        }

        const folder = req.query.folder || req.body.folder || 'products';
        const folderPath = `projet-personnel/${folder}`;

        const uploadedImages = req.files.map(file => ({
            url: file.path,
            isMain: false,
            order: 0
        }));

        return res.status(200).json({
            success: true,
            images: uploadedImages,
            message: `${uploadedImages.length} images téléchargées avec succès dans ${folderPath}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement des images',
            error: error.message
        });
    }
};

/**
 * Supprime une image de Cloudinary
 * Non implémenté pour le moment, mais pourrait être ajouté plus tard
 */
exports.deleteImage = (req, res) => {
    res.status(501).json({ message: "Non implémenté" });
};