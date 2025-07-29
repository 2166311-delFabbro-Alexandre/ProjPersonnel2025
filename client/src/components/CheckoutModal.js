import React, { useState } from 'react';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, cartItems, total, onSubmitOrder }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple email validation
        if (!email || !email.includes('@') || !email.includes('.')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        if (!name) {
            setError('Veuillez entrer votre nom');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const result = await onSubmitOrder({ email, name, cartItems, total });
            console.log('Order submitted successfully:', result);
            setSuccess(true);
        } catch (err) {
            console.error('Error submitting order:', err);
            setError(err.message || 'Une erreur est survenue lors de la commande');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="checkout-modal">
                <button className="close-modal" onClick={onClose}>×</button>

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
                        <h2>Finaliser Votre Commande</h2>

                        <div className="checkout-items">
                            <h3>Récapitulatif</h3>
                            {cartItems.map(item => (
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

                            <div className="checkout-total">
                                <span>Total:</span>
                                <span>{total.toFixed(2)} $</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="checkout-form">
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

                            {error && <div className="error-message">{error}</div>}

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
            </div>
        </div>
    );
}