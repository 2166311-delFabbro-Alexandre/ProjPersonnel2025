import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CheckoutModal from '../components/CheckoutModal';
import './Cart.css';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const handleQuantityChange = (e, productId) => {
        const newQuantity = parseInt(e.target.value);
        if (!isNaN(newQuantity)) {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleSubmitOrder = async ({ email, name, cartItems, total }) => {
        // Here you would typically make an API call to your backend
        try {
            // Check for required fields
            if (!email || !name || !cartItems || cartItems.length === 0) {
                throw new Error('Veuillez remplir tous les champs requis');
            }

            const formattedItems = cartItems.map(item => ({
                productId: item._id, // This is what the server expects
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || ''
            }));

            console.log('Submitting order:', {
                customerName: name,
                customerEmail: email,
                items: formattedItems,
                totalAmount: total
            });

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création de la commande');
            }

            // Clear the cart after successful order
            clearCart();
            return data;
        } catch (error) {
            console.error('Order submission error:', error);
            throw error;
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-container empty-cart">
                <h1>Votre Panier</h1>
                <p>Votre panier est vide.</p>
                <Link to="/shop" className="continue-shopping">
                    Continuer vos achats
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Votre Panier</h1>

            <div className="cart-header">
                <div className="cart-header-item product-info">Produit</div>
                <div className="cart-header-item">Prix</div>
                <div className="cart-header-item">Quantité</div>
                <div className="cart-header-item">Total</div>
                <div className="cart-header-item"></div>
            </div>

            {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                    <div className="product-info">
                        {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                        )}
                        <div className="cart-item-details">
                            <h4>{item.name}</h4>
                            {item.description && <p className="cart-item-description">{item.description}</p>}
                        </div>
                    </div>

                    <div className="cart-item-price">
                        {item.price.toFixed(2)} $
                    </div>

                    <div className="cart-item-quantity">
                        <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={(e) => handleQuantityChange(e, item._id)}
                        />
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

            <div className="cart-summary">
                <button className="clear-cart" onClick={clearCart}>
                    Vider le panier
                </button>

                <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">{getCartTotal().toFixed(2)} $</span>
                </div>
            </div>

            <div className="cart-actions">
                <Link to="/shop" className="continue-shopping">
                    Continuer vos achats
                </Link>
                <button
                    className="checkout-btn"
                    onClick={() => setIsCheckoutModalOpen(true)}
                >
                    Passer la commande
                </button>
            </div>

            {/* Checkout Modal */}
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