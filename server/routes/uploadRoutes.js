const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const uploadImage = require('../middleware/upload');
const uploadController = require("../controllers/uploadController");

const router = express.Router();

/**
 * Route pour le téléchargement d'images
 * Utilise Multer pour gérer le stockage des fichiers
 * Authentifiée - Nécessite un token JWT valide
 */
router.post('/', authenticateToken, (req, res, next) => {
  console.log({ folder: req.query.folder });
  const folder = req.query.folder || 'products';

  // Use the middleware with the specified folder
  uploadImage(folder)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadController.uploadImage);

module.exports = router;