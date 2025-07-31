import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminContentEditor from './AdminContentEditor';
import AdminPortfolio from './AdminPortfolio';
import './AdminDashboard.css';

/**
 * Page de tableau de bord pour les administrateurs.
 * Affiche les données du tableau de bord, permet le téléchargement d'images
 * @returns {JSX.Element} - Le composant de tableau de bord administrateur.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    /**
     * Récupère les données du tableau de bord pour l'administrateur.
     * Gère les erreurs de session expirée et les erreurs de chargement.
     */
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur de chargement des données');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Affiche un message de chargement ou d'erreur si nécessaire
    if (loading && !dashboardData) return <div>Chargement...</div>;
    if (error && !dashboardData) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h2>Tableau de bord Admin</h2>

            { /* Affiche les données du tableau de bord si elles sont disponibles */}
            {dashboardData && (
                <div className="dashboard-data">
                    <p>{dashboardData.message}</p>
                    <p>Connecté en tant que: {dashboardData.user?.username}</p>
                </div>
            )}

            {/* Onglets pour naviguer entre les différentes sections du tableau de bord */}
            <div className="admin-tabs">
                <button
                    className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Produits
                </button>
                <button
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Commandes
                </button>
                <button
                    className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    Contenu des Pages
                </button>
                <button
                    className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                >
                    Portfolio
                </button>
            </div>

            {/* Affiche le contenu de l'onglet actif */}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'content' && <AdminContentEditor />}
            {activeTab === 'portfolio' && <AdminPortfolio />}

            {/* Bouton de déconnexion */}
            <button onClick={logout} className="logout-button">
                Se déconnecter
            </button>

        </div>
    );
}