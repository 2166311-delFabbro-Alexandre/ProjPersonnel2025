import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard'; // Fix the import path
import './Shop.css'; // We'll create this file next

/**
 * Page de la boutique.
 * Affiche les produits disponibles à l'achat.
 * 
 * @returns {JSX.Element} - La page de la boutique.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */
export default function Shop() {
    // États pour gérer les produits, le chargement et les erreurs
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Effet pour charger les produits depuis l'API
    useEffect(() => {
        // Initialisation du chargement
        setLoading(true);
        fetch('/api/products')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Erreur lors du chargement des produits');
                }
                return res.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
                setLoading(false);
            });
    }, []);

    // Affiche un message de chargement ou d'erreur si nécessaire
    if (loading) return <div className="loading">Chargement des produits...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="shop-container">
            <h1>Notre Boutique</h1>

            {products.length === 0 ? (
                // Si aucun produit n'est disponible, affiche un message
                <p className="no-products">Aucun produit disponible pour le moment.</p>
            ) : (
                <>
                    {/* Affiche le nombre de produits disponibles */}
                    <p className="products-count">{products.length} produits disponibles</p>
                    {/* Affiche les produits sous forme de cartes */}
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isAdmin={false}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}