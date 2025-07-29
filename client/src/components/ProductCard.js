import React from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

/**
 * Composant de carte de produit réutilisable
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.product - Les données du produit
 * @param {Function} props.onEdit - Fonction appelée lors du clic sur Modifier
 * @param {Function} props.onDelete - Fonction appelée lors du clic sur Supprimer
 * @param {boolean} props.isAdmin - Indique si les contrôles d'admin doivent être affichés
 * @returns {JSX.Element} - Carte de produit
 */
export default function ProductCard({ product, onEdit, onDelete, isAdmin = false }) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);

        // Optional: Show a temporary notification
        const notification = document.createElement('div');
        notification.className = 'add-to-cart-notification';
        notification.textContent = 'Produit ajouté au panier!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }, 10);
    };

    return (
        <div className="product-card">
            {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} />
            )}
            <h4>{product.name}</h4>
            <p className="price">{product.price.toFixed(2)} $</p>
            <p className="stock">
                {product.inStock ? 'En stock' : 'Rupture de stock'}
            </p>

            {isAdmin ? (
                <div className="product-actions">
                    <button
                        onClick={() => onEdit(product)}
                        className="edit-button"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(product._id)}
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
    );
}