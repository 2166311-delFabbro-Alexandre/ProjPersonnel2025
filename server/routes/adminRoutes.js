const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

router.post("/login", (req, res) => {
  const { username, password } = req.body;

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
});

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Accès autorisé au tableau de bord admin",
    user: req.user
  });
});

module.exports = router;