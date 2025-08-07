const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require('dotenv').config();

/**
 * Configuration de Cloudinary pour le stockage des images.
 * Utilise les variables d'environnement pour les informations sensibles.
 * 
 * Code généré par GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 5 août 2025
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const folder = file.folder || 'products';
    return {
      folder: `projet-personnel/${folder}`,
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

module.exports = {
  cloudinary,
  storage
};