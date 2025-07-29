const jwt = require("jsonwebtoken");

/**
 * Middleware d'authentification JWT
 * Vérifie le token JWT dans le header d'autorisation
 * Ajoute l'utilisateur décodé à l'objet req si l'authentification réussit
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentification requise" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };