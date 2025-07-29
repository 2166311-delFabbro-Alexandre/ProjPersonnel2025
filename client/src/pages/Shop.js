import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard'; // Fix the import path
import './Shop.css'; // We'll create this file next

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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

    if (loading) return <div className="loading">Chargement des produits...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="shop-container">
            <h1>Notre Boutique</h1>
            {products.length === 0 ? (
                <p className="no-products">Aucun produit disponible pour le moment.</p>
            ) : (
                <>
                    <p className="products-count">{products.length} produits disponibles</p>
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