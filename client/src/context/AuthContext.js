import { createContext, useState, useEffect, useContext } from 'react';

/**
 * Contexte d'authentification pour les administrateurs.
 * Fournit des fonctions pour gérer l'authentification et l'état de connexion.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */

// Création du contexte d'authentification
const AuthContext = createContext();

/**
 * Fournit le contexte d'authentification aux composants enfants.
 * Gère l'état de connexion et les fonctions de connexion/déconnexion.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {JSX.Element} props.children - Les composants enfants qui auront accès au contexte
 * 
 * @returns {JSX.Element} - Le fournisseur de contexte
 */
export const AuthProvider = ({ children }) => {
  // État pour gérer l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // État pour gérer le chargement de l'authentification
  const [loading, setLoading] = useState(true);

  // Effet pour vérifier l'authentification lors du montage du composant
  useEffect(() => {
    // Vérification de l'authentification à partir du localStorage
    const checkAuth = () => {
      // Récupère le token d'authentification du localStorage
      const token = localStorage.getItem('adminToken');
      // Met à jour l'état d'authentification en fonction de la présence du token
      setIsAuthenticated(!!token);
      // Met à jour l'état de chargement
      setLoading(false);
    };

    // Appelle la fonction de vérification de l'authentification
    checkAuth();
  }, []);

  /**
   * Fonction de connexion pour les administrateurs.
   * @param {string} token - Le token d'authentification à stocker
   */
  const login = (token) => {
    // Stocke le token d'authentification dans le localStorage
    localStorage.setItem('adminToken', token);
    // Met à jour l'état d'authentification
    setIsAuthenticated(true);
  };

  /**
   * Fonction de déconnexion pour les administrateurs.
   */
  const logout = () => {
    // Supprime le token d'authentification du localStorage
    localStorage.removeItem('adminToken');
    // Met à jour l'état d'authentification
    setIsAuthenticated(false);
  };

  return (
    // Fournit le contexte d'authentification aux composants enfants
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);