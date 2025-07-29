import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Load cart from localStorage on component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
                updateCartCount(parsedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Update localStorage when cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount(cartItems);
    }, [cartItems]);

    // Calculate cart count (total number of items)
    const updateCartCount = (items) => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
    };

    // Add item to cart
    const addToCart = (product) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(item => item._id === product._id);

            if (existingItemIndex >= 0) {
                // Item exists, increment quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1
                };
                return newItems;
            } else {
                // Item doesn't exist, add new item with quantity 1
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    // Update quantity of an item
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

    // Clear the entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    // Calculate cart total
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
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