import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Page de connexion pour les administrateurs.
 * Permet aux administrateurs de se connecter à leur compte.
 * @returns {JSX.Element} - Le composant de connexion administrateur.
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminLogin() {
  // États pour gérer le nom d'utilisateur, le mot de passe, les erreurs et le chargement
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Hooks pour la navigation et le contexte d'authentification
  const navigate = useNavigate();
  const { login } = useAuth();

  // Fonction pour gérer la soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Envoi des données de connexion à l'API
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // Extraction des données de la réponse
      const data = await response.json();

      // Vérification de la réponse de l'API
      if (data.success) {
        // Si la connexion est réussie, stocke le token et redirige vers le tableau de bord
        login(data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Échec de la connexion");
      }
      // Si la réponse n'est pas réussie, affiche un message d'erreur
    } catch (err) {
      setError("Erreur de serveur. Veuillez réessayer.");
      console.error(err);
    } finally {
      // Réinitialise l'état de chargement après la tentative de connexion
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-login-form">
      <h2>Connexion Admin</h2>

      {/* Affiche un message d'erreur si nécessaire */}
      {error && <div className="error-message">{error}</div>}

      {/* Champs de saisie pour le nom d'utilisateur*/}
      <div className="form-group">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Champ de saisie pour le mot de passe */}
      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Bouton de soumission pour la connexion */}
      <button type="submit" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}