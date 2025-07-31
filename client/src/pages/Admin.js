import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

/**
 * Page d'administration principale.
 * Affiche la page de connexion si l'utilisateur n'est pas authentifié,
 * sinon affiche le tableau de bord administrateur.
 * 
 * @returns {JSX.Element} - Le composant d'administration.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Admin() {
  // Utilise le contexte d'authentification pour vérifier si l'utilisateur est authentifié
  const { isAuthenticated } = useAuth();
  // Utilise les hooks pour la navigation et la localisation
  const navigate = useNavigate();
  const location = useLocation();

  // Effet pour rediriger l'utilisateur vers le tableau de bord s'il est déjà authentifié
  // et essaie d'accéder à la page de connexion
  useEffect(() => {
    if (isAuthenticated && location.pathname === "/admin/login") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate, location]);

  // Vérifie si l'utilisateur est sur la page de connexion
  const isLoginPage = location.pathname === "/admin/login";

  return (
    // Affiche le composant de connexion ou le tableau de bord en fonction de l'état d'authentification
    <div className="admin-container">
      {isLoginPage ? (
        <AdminLogin />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}