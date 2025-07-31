import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CheckoutModal from '../components/CheckoutModal';
import './Cart.css';

/**
 * Page de panier.
 * Affiche les articles dans le panier, permet de modifier les quantités,
 * de supprimer des articles et de passer à la caisse.
 * 
 * @returns {JSX.Element} - La page de panier.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Cart() {
    // Utilise le contexte du panier pour accéder aux articles du panier et aux fonctions associées
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    // État pour gérer l'ouverture du modal de passage de commande
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    /**
     * Gère le changement de quantité d'un article dans le panier.
     * 
     * @param {*} e - L'événement de changement.
     * @param {*} productId - L'ID du produit dont la quantité a changé.
     */
    const handleQuantityChange = (e, productId) => {
        const newQuantity = parseInt(e.target.value);
        if (!isNaN(newQuantity)) {
            updateQuantity(productId, newQuantity);
        }
    };

    /**
     * Soumet la commande factice avec les détails du panier.
     * Le système enregistre seulement la commande sans transaction réelle.
     * 
     * @param {Object} orderDetails - Les détails de la commande.
     * @param {string} orderDetails.email - L'email du client.
     * @param {string} orderDetails.name - Le nom du client.
     * @param {Array} orderDetails.cartItems - Les articles du panier.
     * @param {number} orderDetails.total - Le total de la commande.
     * 
     * @returns {Promise} - La promesse de la soumission de la commande.
     */
    const handleSubmitOrder = async ({ email, name, cartItems, total }) => {
        try {
            // Vérifie que les champs requis sont remplis
            if (!email || !name || !cartItems || cartItems.length === 0) {
                throw new Error('Veuillez remplir tous les champs requis');
            }

            // Formate les articles du panier pour l'envoi au serveur
            const formattedItems = cartItems.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || ''
            }));

            // Log les détails de la commande pour le débogage
            console.log('Submitting order:', {
                customerName: name,
                customerEmail: email,
                items: formattedItems,
                totalAmount: total
            });

            // Envoie les données de la commande au serveur
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: name,
                    customerEmail: email,
                    items: formattedItems,
                    totalAmount: total
                })
            });

            // Stocke la réponse du serveur
            const data = await response.json();

            // Vérifie si la réponse est correcte, sinon lance une erreur
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création de la commande');
            }

            // Vide le panier après la soumission de la commande et retourne les données
            clearCart();
            return data;
        } catch (error) {
            // Erreur lors de la soumission de la commande, log l'erreur et lance une exception
            console.error('Order submission error:', error);
            throw error;
        }
    };

    // Si le panier est vide, affiche un message approprié
    if (cartItems.length === 0) {
        return (
            <div className="cart-container empty-cart">
                <h1>Votre Panier</h1>
                <p>Votre panier est vide.</p>
                {/* Lien pour continuer les achats */}
                <Link to="/shop" className="continue-shopping">
                    Continuer vos achats
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Votre Panier</h1>

            {/* En-tête du panier avec les colonnes */}
            <div className="cart-header">
                <div className="cart-header-item product-info">Produit</div>
                <div className="cart-header-item">Prix</div>
                <div className="cart-header-item">Quantité</div>
                <div className="cart-header-item">Total</div>
                <div className="cart-header-item"></div>
            </div>

            {/* Affiche chaque article du panier */}
            {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                    <div className="product-info">
                        {/* Affiche l'image du produit si disponible */}
                        {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                        )}
                        {/* Affiche le nom et la description du produit */}
                        <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            {item.description && <p className="cart-item-description">{item.description}</p>}
                        </div>
                    </div>

                    {/* Affiche le prix de l'article */}
                    <div className="cart-item-price">
                        {item.price.toFixed(2)} $
                    </div>

                    {/* Champ de saisie pour la quantité avec boutons pour augmenter/diminuer */}
                    <div className="cart-item-quantity">
                        {/* Bouton pour diminuer la quantité */}
                        <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        >
                            -
                        </button>
                        {/* Champ de saisie pour la quantité */}
                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(e, item._id)}
                        />
                        {/* Bouton pour augmenter la quantité */}
                        <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>

                    <div className="cart-item-total">
                        {(item.price * item.quantity).toFixed(2)} $
                    </div>

                    <div className="cart-item-remove">
                        <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item._id)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}

            {/* Résumé du panier avec le total et les actions */}
            <div className="cart-summary">
                {/* Bouton pour vider le panier */}
                <button className="clear-cart" onClick={clearCart}>
                    Vider le panier
                </button>

                {/* Affiche le total du panier */}
                <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">{getCartTotal().toFixed(2)} $</span>
                </div>
            </div>

            <div className="cart-actions">
                {/* Lien pour continuer les achats */}
                <Link to="/shop" className="continue-shopping">
                    Continuer vos achats
                </Link>
                {/* Bouton pour ouvrir le modal de passage de commande */}
                <button
                    className="checkout-btn"
                    onClick={() => setIsCheckoutModalOpen(true)}
                >
                    Passer la commande
                </button>
            </div>

            {/* Modal de passage de commande */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                cartItems={cartItems}
                total={getCartTotal()}
                onSubmitOrder={handleSubmitOrder}
            />
        </div>
    );
}