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
    const addToCart = async (product) => {
        try {
            // Vérifie la disponibilité du produit avant de l'ajouter au panier
            const response = await fetch(`/api/products/${product._id}`);

            if (!response.ok) {
                throw new Error('Impossible de vérifier la disponibilité du produit');
            }

            const currentProduct = await response.json();

            // Vérifie si le produit est en stock
            if (!currentProduct.inStock) {
                return {
                    success: false,
                    message: 'Ce produit n\'est plus en stock.'
                };
            }

            // Pour les articles uniques, vérifie s'ils sont déjà dans le panier
            if (currentProduct.isUnique) {
                const existingItem = cartItems.find(item => item._id === product._id);
                if (existingItem) {
                    return {
                        success: false,
                        message: 'Cet article unique est déjà dans votre panier.'
                    };
                }
            }

            // Pour les produits avec une quantité limitée
            if (!currentProduct.isUnique && currentProduct.stockQuantity !== null) {
                // Vérifie la quantité actuelle dans le panier
                const existingItem = cartItems.find(item => item._id === product._id);
                const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

                // Si l'ajout d'un exemplaire dépasse le stock disponible
                if (currentQuantityInCart + 1 > currentProduct.stockQuantity) {
                    let result = {
                        success: false,
                        message: `Désolé, il ne reste que ${currentProduct.stockQuantity} exemplaire(s) en stock.`
                    };

                    return result;
                }
            }

            // Ajoute le produit au panier ou met à jour la quantité si déjà présent
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
                    return [...prevItems, { ...currentProduct, quantity: 1 }];
                }
            });

            return {
                success: true,
                message: 'Produit ajouté au panier!'
            };

        } catch (error) {
            console.error('Error adding to cart:', error);
            return {
                success: false,
                message: 'Impossible d\'ajouter ce produit au panier.'
            };
        }
    };

    // Supprime un article du panier
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    };

    // Met à jour la quantité d'un article
    const updateQuantity = async (productId, quantity) => {
        // Si la quantité est inférieure ou égale à 0, supprime l'article du panier
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        try {
            // Vérifie la disponibilité du produit avant de mettre à jour la quantité
            const response = await fetch(`/api/products/${productId}`);

            if (!response.ok) {
                throw new Error('Impossible de vérifier la disponibilité du produit');
            }

            const currentProduct = await response.json();

            // Vérifie si le produit est en stock
            if (currentProduct.stockQuantity !== null) {
                // Si la quantité demandée dépasse le stock disponible
                if (quantity > currentProduct.stockQuantity) {
                    alert(`Désolé, il ne reste que ${currentProduct.stockQuantity} exemplaire(s) en stock.`);

                    // Si du stock est disponible, met à jour la quantité au maximum
                    if (currentProduct.stockQuantity > 0) {
                        setCartItems(prevItems =>
                            prevItems.map(item =>
                                item._id === productId
                                    ? { ...item, quantity: currentProduct.stockQuantity }
                                    : item
                            )
                        );
                    } else {
                        // Pas de stock disponible, supprime l'article du panier
                        removeFromCart(productId);
                    }
                    return;
                }
            }

            // Si la vérification passe, met à jour la quantité
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === productId ? { ...item, quantity } : item
                )
            );

        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Impossible de mettre à jour la quantité.');
        }
    };

    // Vide le panier
    const clearCart = () => {
        setCartItems([]);
    };

    // Calcule le total du panier
    const getCartTotal = () => {
        return cartItems
            // Filtre les articles disponibles et calcule le total
            .filter(item => item.available !== false)
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Vérifie la disponibilité des articles dans le panier avant la validation
    const verifyCartAvailability = async () => {
        try {
            // Récupère les IDs des produits dans le panier
            const productIds = cartItems.map(item => item._id);

            if (productIds.length === 0) return { valid: true, unavailableItems: [] };

            // Appelle l'API pour vérifier la disponibilité des produits
            const response = await fetch('/api/products/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productIds }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error checking product availability');
            }

            // Analyse la réponse pour identifier les articles non disponibles
            const unavailableItems = [];
            const updatesToApply = [];

            cartItems.forEach(cartItem => {
                const serverProduct = data.products.find(p => p._id === cartItem._id);

                // Si le produit n'existe plus
                if (!serverProduct) {
                    unavailableItems.push({
                        ...cartItem,
                        issue: 'deleted',
                        message: 'Ce produit n\'est plus disponible',
                        available: false
                    });

                    // Ajoute une mise à jour pour marquer l'article comme indisponible
                    updatesToApply.push({
                        id: cartItem._id,
                        type: 'markUnavailable',
                        reason: 'deleted'
                    });
                }
                // Si le produit n'est plus en stock
                else if (!serverProduct.inStock) {
                    unavailableItems.push({
                        ...cartItem,
                        issue: 'outOfStock',
                        message: 'Ce produit n\'est plus en stock',
                        available: false
                    });

                    // Marque l'article comme indisponible dans le panier
                    updatesToApply.push({
                        id: cartItem._id,
                        type: 'markUnavailable',
                        reason: 'outOfStock'
                    });
                }
                // Pour les produits en quantité limitée
                else if (!serverProduct.isUnique && serverProduct.stockQuantity !== null) {
                    if (cartItem.quantity > serverProduct.stockQuantity) {
                        // Cet article a une quantité insuffisante
                        unavailableItems.push({
                            ...cartItem,
                            issue: 'insufficientQuantity',
                            availableQuantity: serverProduct.stockQuantity,
                            message: `Seulement ${serverProduct.stockQuantity} en stock`,
                            available: serverProduct.stockQuantity > 0
                        });

                        if (serverProduct.stockQuantity <= 0) {
                            // Marque l'article comme indisponible dans le panier
                            updatesToApply.push({
                                id: cartItem._id,
                                type: 'markUnavailable',
                                reason: 'outOfStock'
                            });
                        } else {
                            // Marque l'article comme disponible avec une quantité mise à jour
                            updatesToApply.push({
                                id: cartItem._id,
                                type: 'updateQuantity',
                                quantity: serverProduct.stockQuantity
                            });
                        }
                    }
                }
                // Pour les articles uniques qui sont vendus
                else if (serverProduct.isUnique && !serverProduct.inStock) {
                    unavailableItems.push({
                        ...cartItem,
                        issue: 'uniqueItemSold',
                        message: 'Cet article unique a déjà été vendu',
                        available: false
                    });

                    // Marque l'article comme indisponible dans le panier
                    updatesToApply.push({
                        id: cartItem._id,
                        type: 'markUnavailable',
                        reason: 'uniqueItemSold'
                    });
                }
            });

            return {
                valid: unavailableItems.length === 0,
                unavailableItems,
                updatesToApply
            };

        } catch (error) {
            console.error('Error verifying cart availability:', error);
            throw error;
        }
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
            getCartTotal,
            setCartItems,
            verifyCartAvailability
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);