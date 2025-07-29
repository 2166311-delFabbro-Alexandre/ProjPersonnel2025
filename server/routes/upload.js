const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload");
const uploadController = require("../controllers/uploadController");

const router = express.Router();

/**
 * Route pour le téléchargement d'images
 * Utilise Multer pour gérer le stockage des fichiers
 * Authentifiée - Nécessite un token JWT valide
 */
router.post(
  "/",
  authenticateToken,
  uploadMiddleware.single("image"),
  uploadController.uploadImage
);

module.exports = router;