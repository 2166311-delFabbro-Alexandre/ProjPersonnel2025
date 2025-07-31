import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminOrders.css';

/**
 * Page de gestion des commandes pour les administrateurs.
 * Permet aux administrateurs de visualiser et de gérer les commandes.
 * @returns {JSX.Element} - Le composant de gestion des commandes administrateur.
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function AdminOrders() {
    // États pour gérer les commandes, le chargement et les erreurs
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // État pour gérer le filtre des commandes
    const [filter, setFilter] = useState('all');
    // État pour gérer le tri des commandes
    const [sortBy, setSortBy] = useState('date-asc');
    // Hook pour le contexte d'authentification
    const { logout } = useAuth();

    // Récupère les commandes lors du chargement du composant
    useEffect(() => {
        fetchOrders();
    }, []);

    /**
     * Récupère la liste des commandes depuis l'API.
     */
    const fetchOrders = async () => {
        // Actualise l'état de chargement
        setLoading(true);
        try {
            // Récupère le token d'authentification
            const token = localStorage.getItem('adminToken');
            // Envoie une requête à l'API pour récupérer les commandes
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Vérifie si la réponse est réussie
            if (!response.ok) {
                // Si la réponse n'est pas réussie, gère les erreurs de session expirée
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                // Gère les autres erreurs de chargement
                throw new Error('Erreur lors du chargement des commandes');
            }

            // Extrait les données de la réponse
            const data = await response.json();
            // Met à jour l'état des commandes avec les données récupérées
            setOrders(data);
            // En cas d'erreur, met à jour l'état d'erreur
        } catch (err) {
            setError(err.message);
        } finally {
            // Réinitialise l'état de chargement après la récupération des commandes
            setLoading(false);
        }
    };

    /**
     * Gère le changement de statut d'une commande.
     * 
     * @param {string} orderId - L'ID de la commande à mettre à jour.
     * @param {string} newStatus - Le nouveau statut de la commande.
     */
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Récupère le token d'authentification
            const token = localStorage.getItem('adminToken');
            // Envoie une requête à l'API pour mettre à jour le statut de la commande
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            // Vérifie si la réponse est réussie
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            // Extrait les données de la réponse
            const updatedOrder = await response.json();

            // Met à jour la commande dans la liste
            setOrders(orders.map(order =>
                order._id === updatedOrder._id ? updatedOrder : order
            ));
            // En cas d'erreur, affiche un message d'erreur
        } catch (err) {
            setError(err.message);
        }
    };

    // Les commandes filtrées selon le statut sélectionné
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    // Les commandes triées selon le critère sélectionné
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'total-desc') return b.totalAmount - a.totalAmount;
        if (sortBy === 'total-asc') return a.totalAmount - b.totalAmount;
        return 0;
    });

    // Calcul du total des ventes pour les commandes affichées
    const totalSales = sortedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    /**
     * Formate une date pour l'affichage.
     * 
     * @param {string} dateString - La date à formater.
     * @return {string} - La date formatée.
     */
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Affiche un message de chargement ou d'erreur si nécessaire
    if (loading) return <div className="loading">Chargement des commandes...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-orders">
            <h2>Gestion des Commandes</h2>

            <div className="orders-controls">
                { /* Contrôle pour filtrer les commandes par statut */}
                <div className="filter-controls">
                    <label htmlFor="filter-status">Filtrer par statut:</label>
                    <select
                        id="filter-status"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Toutes les commandes</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmées</option>
                        <option value="shipped">Expédiées</option>
                        <option value="delivered">Livrées</option>
                        <option value="cancelled">Annulées</option>
                    </select>
                </div>

                { /* Contrôle pour trier les commandes par montant ou date */}
                <div className="sort-controls">
                    <label htmlFor="sort-by">Trier par:</label>
                    <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date-desc">Date (récent → ancien)</option>
                        <option value="date-asc">Date (ancien → récent)</option>
                        <option value="total-desc">Montant (élevé → bas)</option>
                        <option value="total-asc">Montant (bas → élevé)</option>
                    </select>
                </div>
            </div>

            {/* Affiche un message si aucune commande ne correspond aux critères de filtre */}
            {sortedOrders.length === 0 ? (
                <p className="no-orders">Aucune commande ne correspond à vos critères.</p>
            ) : (
                <>
                    {/* Affiche un résumé des commandes */}
                    <div className="orders-summary">
                        <p>Nombre de commandes: {sortedOrders.length}</p>
                        <p>Total des ventes: {totalSales.toFixed(2)} $</p>
                    </div>
                    {/* Affiche la liste des commandes filtrées et triées */}
                    <div className="orders-list">
                        {sortedOrders.map(order => (
                            <div key={order._id} className={`order-card ${order.status}`}>
                                {/* Le titre de la commande et son statut */}
                                <div className="order-header">
                                    <h3>Commande #{order._id.slice(-6)}</h3>
                                    <span className={`order-status ${order.status}`}>
                                        {order.status === 'pending' && 'En attente'}
                                        {order.status === 'confirmed' && 'Confirmée'}
                                        {order.status === 'shipped' && 'Expédiée'}
                                        {order.status === 'delivered' && 'Livrée'}
                                        {order.status === 'cancelled' && 'Annulée'}
                                    </span>
                                </div>

                                {/* Affiche les informations de la commande */}
                                <div className="order-info">
                                    <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                                    <p><strong>Client:</strong> {order.customerName}</p>
                                    <p><strong>Email:</strong> {order.customerEmail}</p>
                                    <p><strong>Total:</strong> {order.totalAmount.toFixed(2)} $</p>
                                </div>

                                {/* Affiche les articles de la commande avec un toggle pour les détails */}
                                <div className="order-items-toggle">
                                    <details>
                                        <summary>Voir les articles ({order.items.length})</summary>
                                        <table className="order-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Produit</th>
                                                    <th>Prix</th>
                                                    <th>Qté</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.name}</td>
                                                        <td>{item.price.toFixed(2)} $</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{(item.price * item.quantity).toFixed(2)} $</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </details>
                                </div>

                                {/* Permet de changer le statut de la commande */}
                                <div className="order-actions">
                                    <label htmlFor={`status-${order._id}`}>Changer le statut:</label>
                                    <select
                                        id={`status-${order._id}`}
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    >
                                        <option value="pending">En attente</option>
                                        <option value="confirmed">Confirmée</option>
                                        <option value="shipped">Expédiée</option>
                                        <option value="delivered">Livrée</option>
                                        <option value="cancelled">Annulée</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Bouton pour rafraîchir la liste des commandes */}
            <button onClick={fetchOrders} className="refresh-button">
                Rafraîchir les commandes
            </button>
        </div>
    );
}