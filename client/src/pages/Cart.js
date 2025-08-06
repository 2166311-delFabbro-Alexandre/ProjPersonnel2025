import React, { useEffect, useState, useRef } from 'react';
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
    const prevCartItemIdsRef = useRef('');
    // Utilise le contexte du panier pour accéder aux articles du panier et aux fonctions associées
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        setCartItems,
        verifyCartAvailability
    } = useCart();

    // État pour gérer l'ouverture du modal de passage de commande
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    // États pour gérer la vérification de la disponibilité des articles
    const [unavailableItems, setUnavailableItems] = useState([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');

    // Vérifie la disponibilité des articles au montage du composant
    useEffect(() => {
        // N'exécute la vérification que si le panier contient des articles
        if (cartItems.length > 0 && !isVerifying) {
            checkAvailability();
        }
    }, []);

    useEffect(() => {
        // Store a reference to the cart's contents to detect "real" changes
        const cartItemIds = cartItems.map(item => item._id).join(',');

        // Only verify if the cart's IDs have actually changed
        if (cartItemIds !== prevCartItemIdsRef.current) {
            prevCartItemIdsRef.current = cartItemIds;

            // Prevent unnecessary checks during user interactions
            const timer = setTimeout(() => {
                checkAvailability();
            }, 500); // Debounce to avoid multiple rapid checks

            return () => clearTimeout(timer);
        }
    }, [cartItems]);

    // Fonction pour vérifier la disponibilité des produits
    const checkAvailability = async () => {
        // Si une vérification est déjà en cours, ne rien faire
        if (isVerifying) return;

        setIsVerifying(true);
        setVerificationError('');

        try {
            console.log('Starting cart availability check for items:', cartItems);
            const result = await verifyCartAvailability();
            console.log('Availability check result:', result);

            // Vérifie si le résultat est valide
            if (!result.valid) {
                setUnavailableItems(result.unavailableItems);

                // Met à jour les quantités ou supprime les articles non disponibles
                if (result.updatesToApply && result.updatesToApply.length > 0) {
                    // Applique les mises à jour en une seule fois
                    setCartItems(prevItems => {
                        let newItems = [...prevItems];

                        // Applique les mises à jour aux articles du panier
                        result.updatesToApply.forEach(update => {
                            if (update.type === 'markUnavailable') {
                                newItems = newItems.map(item =>
                                    item._id === update.id
                                        ? { ...item, available: false, unavailableReason: update.reason }
                                        : item
                                );
                            } else if (update.type === 'updateQuantity') {
                                newItems = newItems.map(item =>
                                    item._id === update.id
                                        ? { ...item, quantity: update.quantity }
                                        : item
                                );
                            }
                        });

                        return newItems;
                    });
                }

            } else {
                setUnavailableItems([]);
            }
        } catch (error) {
            console.error('Error checking availability:', error);
            setVerificationError('Impossible de vérifier la disponibilité des produits');
        } finally {
            setIsVerifying(false);
        }
    };

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
            // Validate required fields
            if (!email || !name || !cartItems || cartItems.length === 0) {
                throw new Error('Veuillez remplir tous les champs requis');
            }

            console.log('Submitting order with items:', cartItems);
            console.log('Total amount:', total);

            // Send data to server
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: name,
                    customerEmail: email,
                    items: cartItems,
                    totalAmount: total
                })
            });

            // Loggue la réponse brute du serveur
            const rawResponse = await response.text();
            console.log('Raw server response:', rawResponse);

            // Parse la réponse JSON
            // Si la réponse n'est pas JSON, on renvoie un objet vide
            const data = rawResponse ? JSON.parse(rawResponse) : {};

            // Vérifie si la réponse est correcte
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création de la commande');
            }

            // Nettoie le panier après la soumission de la commande
            clearCart();
            return data;
        } catch (error) {
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
            {/* Affiche un message si des articles ne sont plus disponibles */}
            {cartItems.some(item => item.available === false) && (
                <div className="unavailable-explanation">
                    <p>
                        <strong>Note:</strong> Certains articles dans votre panier (affichés en rouge) ne sont plus
                        disponibles et ne seront pas inclus dans votre commande. Vous pouvez les supprimer ou les
                        conserver pour référence.
                    </p>
                </div>
            )}
            <h1>Votre Panier</h1>

            {/* Affiche les erreurs de vérification */}
            {verificationError && (
                <div className="error-message">
                    {verificationError}
                </div>
            )}

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
                <div key={item._id} className={`cart-item ${item.available === false ? 'unavailable-item' : ''}`}>
                    <div className="product-info">
                        {/* Affiche l'image du produit si disponible */}
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className={`cart-item-image ${item.available === false ? 'grayscale' : ''}`}
                            />
                        )}
                        {/* Affiche le nom et la description du produit */}
                        <div className="cart-item-details">
                            <h4 className={item.available === false ? 'strike-through' : ''}>
                                {item.name}
                                {item.available === false && (
                                    <span className="unavailable-badge">
                                        {item.unavailableReason === 'deleted' && 'Produit supprimé'}
                                        {item.unavailableReason === 'outOfStock' && 'Rupture de stock'}
                                        {item.unavailableReason === 'uniqueItemSold' && 'Déjà vendu'}
                                    </span>
                                )}
                            </h4>
                            {item.description && <p className="cart-item-description">{item.description}</p>}
                        </div>
                    </div>

                    {/* Affiche le prix de l'article */}
                    <div className="cart-item-price">
                        {item.price.toFixed(2)} $
                    </div>

                    {/* Champ de saisie pour la quantité avec boutons pour augmenter/diminuer */}
                    <div className="cart-item-quantity">
                        {/* Affiche un message si l'article n'est pas disponible */}
                        {item.available === false ? (
                            <span className="unavailable-quantity">Non disponible</span>
                        ) : (
                            <>
                                {/* Bouton pour diminuer la quantité */}
                                <button
                                    className="quantity-btn"
                                    onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
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
                            </>
                        )}
                    </div>

                    <div className="cart-item-total">
                        {item.available === false ? (
                            <span className="unavailable-total">Indisponible</span>
                        ) : (
                            `${(item.price * item.quantity).toFixed(2)} $`
                        )}
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
                    disabled={isVerifying || cartItems.length === 0}
                >
                    {isVerifying ? 'Vérification...' : 'Passer la commande'}
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