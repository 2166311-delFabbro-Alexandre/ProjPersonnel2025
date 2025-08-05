const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const upload = require('../middleware/upload');
const uploadController = require("../controllers/uploadController");

const router = express.Router();

/**
 * Route pour le téléchargement d'une image.
 * Utilise Multer pour gérer le stockage des fichiers
 * Authentifiée - Nécessite un token JWT valide
 */
router.post('/', authenticateToken, (req, res, next) => {
  // Trouve le dossier à partir de la requête ou utilise 'products' par défaut
  const folder = req.query.folder || 'products';

  // Utilise le middleware Multer configuré pour le dossier spécifié
  upload.single(folder)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadController.uploadImage);

/**
 * Route pour le téléchargement de plusieurs images.
 * Authentifiée - Nécessite un token JWT valide
 */
router.post('/multiple', authenticateToken, (req, res, next) => {
  // Trouve le dossier à partir de la requête ou utilise 'products' par défaut
  const folder = req.query.folder || 'products';

  // Utilise le middleware Multer configuré pour le dossier spécifié
  upload.multiple(folder)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadController.uploadMultipleImages);

module.exports = router;