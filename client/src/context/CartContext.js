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
    // État pour stocker les articles du panier
    const [cartItems, setCartItems] = useState(() => {
        // Charge les articles du panier depuis le localStorage ou initialise un tableau vide
        const savedCart = localStorage.getItem('cart');
        // Tente de parser les données du panier, si le parsing échoue, vide le localStorage
        // et retourne un tableau vide
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
                localStorage.removeItem('cart');
                return [];
            }
        }
        // Si aucun article n'est trouvé, retourne un tableau vide
        return [];
    });
    // État pour stocker le nombre total d'articles dans le panier
    const [cartCount, setCartCount] = useState(0);

    // Met à jour le nombre d'articles dans le panier chaque fois que cartItems change
    useEffect(() => {
        const count = cartItems.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
    }, [cartItems]);

    // Met à jour le localStorage lorsque le panier change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

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