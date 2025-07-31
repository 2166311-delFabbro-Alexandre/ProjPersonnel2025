const jwt = require("jsonwebtoken");

/**
 * Controleur pour gérer les fonctionnalités d'administration
 * Ce module contient des fonctions pour l'authentification des administrateurs,
 * la récupération des données du tableau de bord et des statistiques.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 31 juillet 2025
 */

/**
 * Authentifie un administrateur et génère un token JWT
 * @param {Object} req - La requête Express
 * @param {Object} res - La réponse Express
 */
exports.login = (req, res) => {
    // Variables pour les identifiants d'administration
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

    // Vérification des identifiants d'administration
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Génération du token JWT
        const token = jwt.sign(
            { username, role: "admin" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Envoi de la réponse avec le token
        res.status(200).json({
            success: true,
            token,
            message: "Connexion réussie"
        });
    } else {
        // Envoi d'une erreur si les identifiants sont incorrects
        res.status(401).json({
            success: false,
            message: "Nom d'utilisateur ou mot de passe invalide"
        });
    }
};

/**
 * Renvoie les données du tableau de bord administrateur
 * @param {Object} req - La requête Express
 * @param {Object} res - La réponse Express
 */
exports.getDashboardData = (req, res) => {
    res.json({
        message: "Accès autorisé au tableau de bord admin",
        user: req.user
    });
};

/**
 * Récupère des statistiques pour le tableau de bord admin
 * @param {Object} req - La requête Express
 * @param {Object} res - La réponse Express
 */
exports.getStats = async (req, res) => {
    try {
        // Statistiques fictives pour l'exemple
        const stats = {
            totalProducts: 0, // Vous pourriez utiliser Product.countDocuments()
            totalOrders: 0,
            recentActivity: []
        };

        res.json(stats);
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des statistiques"
        });
    }
};