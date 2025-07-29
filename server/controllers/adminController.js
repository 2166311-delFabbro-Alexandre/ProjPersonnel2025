const jwt = require("jsonwebtoken");

/**
 * Controller pour gérer les fonctionnalités d'administration
 * @module controllers/adminController
 */

/**
 * Authentifie un administrateur et génère un token JWT
 * @param {Object} req - La requête Express
 * @param {Object} res - La réponse Express
 */
exports.login = (req, res) => {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
    const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign(
            { username, role: "admin" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            token,
            message: "Connexion réussie"
        });
    } else {
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
        // Ici, vous pourriez ajouter une logique pour récupérer des statistiques réelles
        // Par exemple, le nombre de produits, commandes, utilisateurs, etc.

        // Pour l'instant, renvoyons des statistiques fictives
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