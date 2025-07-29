const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

/**
 * Route de connexion administrateur
 * Génère un token JWT si les identifiants sont valides
 */
router.post("/login", adminController.login);

/**
 * Route du tableau de bord administrateur
 * Protégée - Nécessite un token JWT valide
 */
router.get("/dashboard", authenticateToken, adminController.getDashboardData);

/**
 * Route des statistiques administrateur
 * Protégée - Nécessite un token JWT valide
 */
router.get("/stats", authenticateToken, adminController.getStats);

module.exports = router;