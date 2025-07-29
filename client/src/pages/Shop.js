import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function Shop() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    return (
        <div className="shop-container">
            <h1>Boutique</h1>
            <div className="products-grid">
                {products.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        isAdmin={false} // No edit/delete buttons
                    />
                ))}
            </div>
        </div>
    );
}