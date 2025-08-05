import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

/**
 * Page de détail d'un produit.
 * Affiche les informations détaillées d'un produit avec une image agrandie.
 * 
 * @returns {JSX.Element} - La page de détail du produit
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 5 août 2025
 */
export default function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(null);

    // Récupère les détails du produit depuis l'API
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/${productId}`);

                if (!response.ok) {
                    throw new Error('Produit non trouvé');
                }

                const data = await response.json();
                setProduct(data);

                if (data.images && data.images.length > 0) {
                    const mainImage = data.images.find(img => img.isMain) || data.images[0];
                    setSelectedImage(mainImage.url);
                } else if (data.imageUrl) {
                    setSelectedImage(data.imageUrl);
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError(err.message || 'Erreur lors du chargement du produit');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleThumbnailClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    /**
     * Gère l'ajout du produit au panier.
     * Affiche une notification après l'ajout.
     */
    const handleAddToCart = async () => {
        if (!product || !product.inStock) return;

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

    // Affiche un indicateur de chargement pendant le chargement des données
    if (loading) {
        return (
            <div className="product-detail-container loading">
                <div className="loader"></div>
                <p>Chargement du produit...</p>
            </div>
        );
    }

    // Affiche un message d'erreur si la récupération a échoué
    if (error || !product) {
        return (
            <div className="product-detail-container error">
                <h2>Erreur</h2>
                <p>{error || 'Produit non trouvé'}</p>
                <Link to="/" className="back-link">Retour à la boutique</Link>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-breadcrumb">
                <Link to="/">Accueil</Link> &gt; <span>{product.name}</span>
            </div>

            <div className="product-detail-content">
                {/* Colonne gauche avec l'image */}
                <div className="product-detail-image-container">
                    <div className="product-detail-main-image">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="product-large-image"
                            />
                        ) : (
                            <div className="no-image">
                                Aucune image disponible
                            </div>
                        )}
                    </div>

                    {/* Affichage des vignettes pour les autres images */}
                    {product.images && product.images.length > 1 && (
                        <div className="product-thumbnails">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === image.url ? 'active' : ''}`}
                                    onClick={() => handleThumbnailClick(image.url)}
                                >
                                    <img src={image.url} alt={`${product.name} - image ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Colonne droite avec les informations */}
                <div className="product-detail-info">
                    <h1 className="product-detail-name">{product.name}</h1>

                    <div className="product-detail-price">{product.price.toFixed(2)} $</div>

                    <div className="product-detail-stock">
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

                    {/* Description du produit */}
                    <div className="product-detail-description">
                        <h2>Description</h2>
                        <p>{product.description || 'Aucune description disponible'}</p>
                    </div>

                    {/* Bouton d'ajout au panier */}
                    <button
                        onClick={handleAddToCart}
                        className="add-to-cart-button"
                        disabled={!product.inStock}
                    >
                        {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
                    </button>

                    {/* Lien de retour à la boutique */}
                    <Link to="/shop" className="back-to-shop">
                        Retour à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}