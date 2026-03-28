/**
 * Pharmacy Cart Storage
 * 
 * Manages cart items using AsyncStorage for persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@pharmacy_cart';

/**
 * Get all cart items
 * @returns {Promise<Array>} Cart items array
 */
export const getCartItems = async () => {
    try {
        const data = await AsyncStorage.getItem(CART_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting cart items:', error);
        return [];
    }
};

/**
 * Save cart items
 * @param {Array} items - Cart items array
 */
export const saveCartItems = async (items) => {
    try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving cart items:', error);
        return false;
    }
};

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @returns {Promise<{success: boolean, cart: Array, message: string}>}
 */
export const addToCart = async (product) => {
    try {
        const cart = await getCartItems();
        const productIdStr = String(product.id || Date.now());

        // Check if item already exists
        const existingIndex = cart.findIndex(item => String(item.id) === productIdStr);

        if (existingIndex >= 0) {
            // Increase quantity
            cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
        } else {
            // Add new item
            cart.push({
                id: productIdStr,
                name: product.name,
                desc: product.desc || product.description || '',
                price: product.price,
                qty: 1,
                image: product.image,
            });
        }

        await saveCartItems(cart);

        return {
            success: true,
            cart,
            message: existingIndex >= 0 ? 'Quantity updated' : 'Added to cart',
        };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return {
            success: false,
            cart: [],
            message: 'Failed to add to cart',
        };
    }
};

/**
 * Remove item from cart
 * @param {string|number} productId - Product ID to remove
 * @returns {Promise<Array>} Updated cart
 */
export const removeFromCart = async (productId) => {
    try {
        const cart = await getCartItems();
        const productIdStr = String(productId);
        const updatedCart = cart.filter(item => String(item.id) !== productIdStr);
        await saveCartItems(updatedCart);
        return updatedCart;
    } catch (error) {
        console.error('Error removing from cart:', error);
        return await getCartItems();
    }
};

/**
 * Update item quantity
 * @param {string|number} productId - Product ID
 * @param {number} delta - Change in quantity (+1 or -1)
 * @returns {Promise<Array>} Updated cart
 */
export const updateQuantity = async (productId, delta) => {
    try {
        const cart = await getCartItems();
        const productIdStr = String(productId);

        const updatedCart = cart.map(item => {
            if (String(item.id) === productIdStr) {
                const newQty = (item.qty || 1) + delta;
                return { ...item, qty: Math.max(1, newQty) };
            }
            return item;
        });

        await saveCartItems(updatedCart);
        return updatedCart;
    } catch (error) {
        console.error('Error updating quantity:', error);
        return await getCartItems(); // Return current cart on error
    }
};

/**
 * Clear all cart items
 * @returns {Promise<boolean>}
 */
export const clearCart = async () => {
    try {
        await AsyncStorage.removeItem(CART_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
};

/**
 * Get cart count
 * @returns {Promise<number>} Total items in cart
 */
export const getCartCount = async () => {
    try {
        const cart = await getCartItems();
        return cart.reduce((sum, item) => sum + item.qty, 0);
    } catch (error) {
        return 0;
    }
};

/**
 * Get cart total
 * @returns {Promise<{subtotal: number, taxes: number, total: number}>}
 */
export const getCartTotal = async () => {
    try {
        const cart = await getCartItems();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const taxes = Math.round(subtotal * 0.1); // 10% tax
        return {
            subtotal,
            taxes,
            total: subtotal + taxes,
        };
    } catch (error) {
        return { subtotal: 0, taxes: 0, total: 0 };
    }
};

export default {
    getCartItems,
    saveCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
};
