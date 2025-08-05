import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Soins from "./pages/Soins";
import Admin from "./pages/Admin";
import ProductDetail from './pages/ProductDetail';
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

/**
 * Application principale de l'interface utilisateur.
 * Gère les routes et l'authentification des administrateurs.
 * 
 * @returns {JSX.Element} - Le composant principal de l'application.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */

/**
 * Composant de route protégée pour les pages administratives.
 * Vérifie si l'utilisateur est authentifié avant de rendre le contenu.
 *
 * @param {Object} props - Les propriétés du composant.
 * @param {JSX.Element} props.children - Les enfants à rendre si l'utilisateur est authentifié.
 *
 * @return {JSX.Element} - Le contenu rendu si l'utilisateur est authentifié, sinon redirige vers la page de connexion.
 */
function ProtectedRoute({ children }) {
  // Utilise le contexte d'authentification pour vérifier si l'utilisateur est authentifié
  const { isAuthenticated, loading } = useAuth();

  // Affiche un message de chargement pendant la vérification de l'authentification
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur est authentifié, rend les enfants, sinon redirige vers la page de connexion
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
}

/**
 * Composant de gestion des routes de l'application.
 *
 * @returns {JSX.Element} - Les routes de l'application.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/soins" element={<Soins />} />
      <Route path="/admin" element={<Navigate to="/admin/login" />} />
      <Route path="/admin/login" element={<Admin />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Composant principal de l'application.
 *
 * @returns {JSX.Element} - Le composant principal de l'application.
 */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <div className="app-container">
            <AppRoutes />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;