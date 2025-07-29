import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminOrders.css';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', etc.
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'total-desc', etc.
    const { logout } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout();
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors du chargement des commandes');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            const updatedOrder = await response.json();

            // Update the order in the list
            setOrders(orders.map(order =>
                order._id === updatedOrder._id ? updatedOrder : order
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'total-desc') return b.totalAmount - a.totalAmount;
        if (sortBy === 'total-asc') return a.totalAmount - b.totalAmount;
        return 0;
    });

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

    if (loading) return <div className="loading">Chargement des commandes...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-orders">
            <h2>Gestion des Commandes</h2>

            <div className="orders-controls">
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

            {sortedOrders.length === 0 ? (
                <p className="no-orders">Aucune commande ne correspond à vos critères.</p>
            ) : (
                <div className="orders-list">
                    {sortedOrders.map(order => (
                        <div key={order._id} className={`order-card ${order.status}`}>
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

                            <div className="order-info">
                                <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                                <p><strong>Client:</strong> {order.customerName}</p>
                                <p><strong>Email:</strong> {order.customerEmail}</p>
                                <p><strong>Total:</strong> {order.totalAmount.toFixed(2)} $</p>
                            </div>

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
            )}

            <button onClick={fetchOrders} className="refresh-button">
                Rafraîchir les commandes
            </button>
        </div>
    );
}