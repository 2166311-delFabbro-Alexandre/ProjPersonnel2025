import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CheckoutModal.css';

/**
 * Composant pour gérer le modal de checkout.
 * Permet aux utilisateurs de finaliser leur commande en fournissant leur nom et email.
 * @returns {JSX.Element} - Le composant de gestion du checkout
 *
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function CheckoutModal({ isOpen, onClose, cartItems, total, onSubmitOrder }) {
    // États pour gérer le courriel et le nom de l'utilisateur
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    // États pour gérer l'état de soumission, les erreurs et le succès
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    // Importation du contexte du panier pour vérifier la disponibilité des articles
    const { verifyCartAvailability } = useCart();

    // Filtre les articles disponibles dans le panier
    const availableItems = cartItems.filter(item => item.available !== false);

    // Recalcule le total en fonction des articles disponibles
    const availableTotal = availableItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    // Vérifie si certains articles du panier ne sont pas disponibles
    const hasUnavailableItems = cartItems.length > availableItems.length;

    // Fonction pour gérer la soumission du formulaire de commande
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation du courriel
        if (!email || !email.includes('@') || !email.includes('.')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        // Validation du nom
        if (!name) {
            setError('Veuillez entrer votre nom');
            return;
        }

        // Vérifie qu'il y a des articles disponibles pour la commande
        if (availableItems.length === 0) {
            setError('Aucun article disponible dans votre panier pour passer commande');
            return;
        }

        // Réinitialisation des erreurs et état de soumission
        setError('');
        setIsSubmitting(true);

        try {
            // Vérification de la disponibilité des articles dans le panier
            const availableItemsToSubmit = availableItems.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || ''
            }));

            // Log what we're sending to server
            console.log('Submitting order with items:', availableItemsToSubmit);

            // Call onSubmitOrder with only available items
            const result = await onSubmitOrder({
                email,
                name,
                cartItems: availableItemsToSubmit,
                total: availableTotal
            });

            console.log('Order submitted successfully:', result);
            setSuccess(true);
        } catch (err) {
            // Gestion des erreurs lors de la soumission de la commande
            console.error('Error submitting order:', err);
            setError(err.message || 'Une erreur est survenue lors de la commande');
        } finally {
            // Réinitialisation de l'état de soumission
            setIsSubmitting(false);
        }
    };

    // Si le modal n'est pas ouvert, ne rien afficher
    if (!isOpen) return null;

    return (
        <div className={`checkout-modal-overlay open`}>
            <div className="checkout-modal">
                <h2>Finaliser la Commande</h2>
                {/* Bouton de fermeture du modal */}
                <button className="close-modal" onClick={onClose}>×</button>

                {/* Affichage du message de succès ou du formulaire de commande */}
                {success ? (
                    <div className="success-message">
                        <h2>Commande Confirmée!</h2>
                        <p>Merci pour votre commande, {name}!</p>
                        <p>Un récapitulatif a été envoyé à {email}.</p>
                        <button
                            className="close-success-btn"
                            onClick={() => {
                                onClose();
                                setSuccess(false);
                            }}
                        >
                            Fermer
                        </button>
                    </div>
                ) : (
                    <>
                        {hasUnavailableItems && (
                            <div className="checkout-warning">
                                <p>Certains articles de votre panier ne sont plus disponibles et ont été exclus de cette commande.</p>
                            </div>
                        )}

                        {availableItems.length === 0 ? (
                            <div className="no-available-items">
                                <p>Tous les articles de votre panier sont indisponibles. Vous ne pouvez pas passer commande.</p>
                                <button className="close-btn" onClick={onClose}>Retourner au panier</button>
                            </div>
                        ) : (
                            <>
                                {/* Les éléments disponibles du panier et leurs totaux */}
                                <div className="checkout-items">
                                    <h3>Récapitulatif</h3>
                                    {availableItems.map(item => (
                                        <div key={item._id} className="checkout-item">
                                            <div className="checkout-item-info">
                                                <span className="checkout-item-name">{item.name}</span>
                                                <span className="checkout-item-quantity">× {item.quantity}</span>
                                            </div>
                                            <span className="checkout-item-total">
                                                {(item.price * item.quantity).toFixed(2)} $
                                            </span>
                                        </div>
                                    ))}

                                    {/* Affichage du total recalculé */}
                                    <div className="checkout-total">
                                        <span>Total:</span>
                                        <span>{availableTotal.toFixed(2)} $</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="checkout-form">
                                    {/* Champ nom */}
                                    <div className="form-group">
                                        <label htmlFor="name">Nom</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Votre nom"
                                            required
                                        />
                                    </div>

                                    {/* Champ email */}
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="votre@email.com"
                                            required
                                        />
                                    </div>

                                    {/* Affichage des messages d'erreur si nécessaire */}
                                    {error && <div className="error-message">{error}</div>}

                                    {/* Bouton de soumission pour confirmer la commande */}
                                    <button
                                        type="submit"
                                        className="confirm-order-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}