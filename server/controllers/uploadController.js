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

        console.log(`Image uploaded to ${folderPath}: ${imageUrl}`);

        res.json({
            imageUrl: imageUrl,
            message: `Image téléchargée avec succès dans ${folderPath}`
        });
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
    res.status(501).json({ message: "Non implémenté" });
};