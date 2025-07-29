const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage });

/**
 * Route pour le téléchargement d'images
 * Utilise Multer pour gérer le stockage des fichiers
 */
router.post("/", authenticateToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }
    res.json({ imageUrl: req.file.path });
    console.log("Image uploaded:", req.file.path);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Erreur lors du téléchargement de l'image" });
  }
});

module.exports = router;