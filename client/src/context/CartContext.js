import { createContext, useState, useContext, useEffect } from 'react';

/**
 * Contexte pour gérer le panier d'achats.
 * Fournit des fonctions pour ajouter, supprimer et mettre à jour les articles du panier.
 * 
 * @author Alexandre del Fabbro
 * Code inspiré de GitHub Copilot - Claude Sonnet 3.7 [Modèle massif de langage] - Version 30 juillet 2025
 */

// Création du contexte du panier
const CartContext = createContext();

/**
 * Fournit le contexte du panier aux composants enfants.
 * Gère l'état du panier, le nombre d'articles et les fonctions associées.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {JSX.Element} props.children - Les composants enfants qui auront accès au contexte
 * 
 * @returns {JSX.Element} - Le fournisseur de contexte
 */
export const CartProvider = ({ children }) => {
    // État pour stocker les articles du panier et le nombre total d'articles
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Charge les articles du panier depuis le localStorage lors du montage du composant
    useEffect(() => {
        // Récupère les données du panier depuis le localStorage
        const savedCart = localStorage.getItem('cart');

        // Si des données existent, les parse et les stocke dans l'état
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
                updateCartCount(parsedCart);
            } catch (e) {
                // En cas d'erreur de parsing, log l'erreur et vide le localStorage
                console.error('Error parsing cart data:', e);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Met à jour le localStorage lorsque le panier change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount(cartItems);
    }, [cartItems]);

    // Calcule le nombre total d'articles dans le panier
    const updateCartCount = (items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
    };

    // Ajouter un article au panier
    const addToCart = (product) => {
        setCartItems(prevItems => {
            // Vérifie si l'article existe déjà dans le panier
            const existingItemIndex = prevItems.findIndex(item => item._id === product._id);

            if (existingItemIndex >= 0) {
                // L'article existe, incrémente la quantité
                const newItems = [...prevItems];
                // Met à jour la quantité de l'article existant
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
                return newItems;
            } else {
                // L'article n'existe pas, ajoute un nouvel article avec une quantité de 1
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    // Supprime un article du panier
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    // Met à jour la quantité d'un article
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId ? { ...item, quantity } : item
            )
        );
    };

    // Vide le panier
    const clearCart = () => {
        setCartItems([]);
    };

    // Calcule le total du panier
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        // Fournit le contexte du panier aux composants enfants
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);