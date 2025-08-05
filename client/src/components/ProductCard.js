import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

/**
 * Composant de carte de produit réutilisable
 * Affiche les détails d'un produit et permet des actions comme l'ajout au panier ou la modification/suppression pour les administrateurs.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.product - Les données du produit
 * @param {Function} props.onEdit - Fonction appelée lors du clic sur Modifier
 * @param {Function} props.onDelete - Fonction appelée lors du clic sur Supprimer
 * @param {boolean} props.isAdmin - Indique si les contrôles d'admin doivent être affichés
 * @returns {JSX.Element} - Carte de produit
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function ProductCard({ product, onEdit, onDelete, isAdmin = false }) {
    // Hook pour gérer le panier
    const { addToCart } = useCart();

    /**
     * Gère l'ajout du produit au panier.
     * Affiche une notification temporaire après l'ajout.
     */
    const handleAddToCart = async (e) => {
        // Empêche la navigation vers la page de détail lors du clic sur le bouton
        e.preventDefault();
        e.stopPropagation();

        // Appelle la fonction d'ajout au panier du contexte
        const result = await addToCart(product);

        if (result.success) {
            // Affiche un message de notification temporaire
            const notification = document.createElement('div');
            notification.className = 'add-to-cart-notification';
            notification.textContent = result.message;
            document.body.appendChild(notification);

            // Gère l'affichage du message de notification
            setTimeout(() => {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 300);
                }, 2000);
            }, 10);
        } else {
            // Affiche une alerte si l'ajout échoue
            alert(result.message || 'Erreur lors de l\'ajout au panier.');
        }
    };

    /**
     * Gère les clics sur les boutons d'administration
     * @param {Event} e - L'événement de clic
     * @param {Function} action - L'action à exécuter
     */
    const handleAdminAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };

    return (
        // Rendu de la carte de produit avec lien vers la page de détail
        <Link to={`/product/${product._id}`} className="product-card-link">
            <div className="product-card">
                {/* Affiche l'image du produit si disponible */}
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                        alt={product.name}
                    />
                ) : product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : null}

                {/* Affiche le nom, le prix et la disponibilité du produit */}
                <h4>{product.name}</h4>
                <p className="price">{product.price.toFixed(2)} $</p>
                {/* Stock information */}
                <div className="product-stock-info">
                    {!product.inStock ? (
                        <span className="out-of-stock">Rupture de stock</span>
                    ) : product.isUnique ? (
                        <span className="unique-item">Article unique</span>
                    ) : product.stockQuantity !== null ? (
                        <span className="stock-quantity">
                            {product.stockQuantity} en stock
                        </span>
                    ) : (
                        <span className="in-stock">En stock</span>
                    )}
                </div>

                {/* Affiche les actions pour les administrateurs ou le bouton d'ajout au panier */}
                {isAdmin ? (
                    <div className="product-actions admin-actions">
                        <button
                            onClick={(e) => handleAdminAction(e, () => onEdit(product))}
                            className="edit-button"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={(e) => handleAdminAction(e, () => onDelete(product._id))}
                            className="delete-button"
                        >
                            Supprimer
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="add-to-cart-button"
                        disabled={!product.inStock}
                    >
                        {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
                    </button>
                )}
            </div>
        </Link>
    );
}