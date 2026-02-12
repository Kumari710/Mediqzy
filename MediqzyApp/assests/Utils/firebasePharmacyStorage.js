/**
 * Firebase Pharmacy Storage Service
 * 
 * Manages pharmacy cart, orders, and favorites using Firebase
 * Syncs data across devices and provides real-time updates
 */

import database from '@react-native-firebase/database';
import { getCurrentUser } from './firebaseAuth';
import { createNotification, db } from './firebaseDatabase';
import { showAddToCartNotification } from './localNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Local storage keys for offline caching
const LOCAL_KEYS = {
    CART_CACHE: '@firebase_pharmacy_cart',
    ORDERS_CACHE: '@firebase_pharmacy_orders',
    FAVORITES_CACHE: '@firebase_pharmacy_favorites',
};

const DB_URL = 'https://mediczy-624ed-default-rtdb.asia-southeast1.firebasedatabase.app/';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get current user ID
 */
const getCurrentUserId = () => {
    return getCurrentUser()?.uid || null;
};

// =====================================================
// CART FUNCTIONS
// =====================================================

/**
 * Get cart items from Firebase
 * @returns {Promise<Array>} Cart items array
 */
export const getCartItems = async () => {
    const userId = getCurrentUserId();

    try {
        if (userId) {
            try {
                // Use a timeout for cloud fetch to prevent hanging
                const cloudFetchPromise = db()
                    .ref(`pharmacyCart/${userId}`)
                    .once('value');

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Cloud timeout')), 3000)
                );

                const snapshot = await Promise.race([cloudFetchPromise, timeoutPromise]);

                if (snapshot && snapshot.exists()) {
                    const data = snapshot.val();
                    const items = [];

                    if (data && typeof data === 'object') {
                        Object.entries(data).forEach(([key, value]) => {
                            // SKIP entries that are null, not objects, or missing basic names
                            if (value && typeof value === 'object' && (value.name || value.id)) {
                                items.push({
                                    id: String(key),
                                    ...value,
                                });
                            }
                        });
                    }

                    // Cache locally for offline use
                    await AsyncStorage.setItem(LOCAL_KEYS.CART_CACHE, JSON.stringify(items));
                    console.log(`Cart fetched from cloud: ${items.length} valid items found`);
                    return items;
                }
            } catch (cloudError) {
                console.warn('Cloud cart fetch skipped or failed:', cloudError.message);
            }
        }

        // Always fall back to local cache
        const localData = await AsyncStorage.getItem(LOCAL_KEYS.CART_CACHE);
        if (localData) {
            const items = JSON.parse(localData);
            return Array.isArray(items) ? items : [];
        }
        return [];
    } catch (error) {
        console.warn('Error in getCartItems:', error.message);
        return [];
    }
};

/**
 * Add item to cart
 * @param {Object} product - Product to add
 * @returns {Promise<{success: boolean, cart: Array, message: string}>}
 */
export const addToCart = async (product) => {
    const userId = getCurrentUserId();
    const productId = String(product.id || Date.now());

    // Validate product data
    if (!product.name || product.name === 'undefined' || product.name === 'NaN') {
        console.warn('Invalid product data, skipping add to cart');
        return { success: false, cart: [], message: 'Invalid product data' };
    }

    try {
        let cart = await getCartItems();

        // Filter out any invalid/corrupted items from cart
        cart = cart.filter(item =>
            item &&
            item.id &&
            item.name &&
            item.name !== 'undefined' &&
            item.name !== 'NaN' &&
            !isNaN(item.price) &&
            !isNaN(item.qty)
        );

        const existingIndex = cart.findIndex(item => String(item.id) === productId);

        let updatedCart;
        let message;
        const requestedQty = parseInt(product.qty) || 1;

        if (existingIndex >= 0) {
            // Increase quantity
            const newCart = [...cart];
            const currentQty = parseInt(newCart[existingIndex].qty) || 0;
            newCart[existingIndex] = {
                ...newCart[existingIndex],
                qty: currentQty + requestedQty
            };
            updatedCart = newCart;
            message = 'Quantity updated';
        } else {
            // Parse and validate price
            let price = 0;
            if (typeof product.price === 'string') {
                price = parseFloat(product.price.replace(/[^\\d.]/g, '')) || 0;
            } else {
                price = parseFloat(product.price) || 0;
            }

            // Add new item with imageName preserved
            const newItem = {
                id: productId,
                name: String(product.name),
                desc: String(product.desc || product.description || ''),
                price: price,
                qty: requestedQty,
                imageName: product.imageName || 'drug1.png', // Preserve image name
                image: typeof product.image === 'object' ? null : product.image,
                addedAt: new Date().toISOString(),
            };
            updatedCart = [...cart, newItem];
            message = 'Added to cart';
        }

        // SAVE LOCALLY FIRST - THIS IS CRITICAL
        await AsyncStorage.setItem(LOCAL_KEYS.CART_CACHE, JSON.stringify(updatedCart));

        // Sync to cloud in BACKGROUND - don't await this
        if (userId) {
            saveCartToFirebase(updatedCart).catch(err =>
                console.warn('Background cloud sync failed:', err.message)
            );
        }

        // Show push notification for cart addition
        showAddToCartNotification({
            productName: String(product.name),
            cartType: 'pharmacy',
            quantity: requestedQty,
        }).catch(err => console.warn('Notification failed:', err.message));

        // Also store in Firebase notifications for the history list
        if (userId) {
            console.log(`[PharmacyStorage] Calling createNotification for user: ${userId}`);
            try {
                const pId = String(product.id || Date.now());
                console.log(`[PharmacyStorage] Creating DB notification for product: ${product.name} (${pId})`);
                const res = await createNotification(userId, {
                    type: 'order',
                    title: 'Item Added to Cart',
                    message: `${product.name} has been added to your pharmacy cart.`,
                    data: { productId: pId, type: 'cart_add', cartType: 'pharmacy' }
                });
                console.log('[PharmacyStorage] createNotification result:', JSON.stringify(res));
            } catch (err) {
                console.warn('[PharmacyStorage] DB notification failed:', err.message);
            }
        } else {
            console.warn('[PharmacyStorage] No userId found, cannot create DB notification');
        }

        return { success: true, cart: updatedCart, message };
    } catch (error) {
        console.warn('Critical error in addToCart:', error.message);
        return { success: false, cart: [], message: 'Failed to add to cart' };
    }
};

/**
 * Save cart to Firebase
 */
const saveCartToFirebase = async (cart) => {
    const userId = getCurrentUserId();
    console.log('saveCartToFirebase called, userId:', userId);
    if (!userId) {
        console.warn('No userId, skipping Firebase sync');
        return;
    }

    try {
        const cartData = {};
        cart.forEach(item => {
            // ONLY keep items that have a valid ID and Name
            if (item && item.id && item.name && item.name !== 'undefined') {
                cartData[item.id] = {
                    name: String(item.name),
                    desc: String(item.desc || item.description || ''),
                    price: parseFloat(item.price) || 0,
                    qty: parseInt(item.qty) || 1,
                    imageName: item.imageName || 'drug1.png', // Preserve image name
                    image: typeof item.image === 'object' ? null : item.image,
                    addedAt: item.addedAt || new Date().toISOString(),
                };
            }
        });

        // If the cart is effectively empty (all items were filtered out), 
        // we should still clear it in Firebase instead of leaving old data
        console.log('Syncing cart to Firebase, count:', Object.keys(cartData).length);
        await db().ref(`pharmacyCart/${userId}`).set(cartData);
        console.log('Cart saved to Firebase successfully!');
        // Uncomment below line to see sync confirmation:
        // Alert.alert('Firebase Sync', 'Cart synced to cloud!');
    } catch (error) {
        console.error('Error saving cart to Firebase:', error.message);
        Alert.alert('Firebase Sync Error', error.message);
    }
};

/**
 * Remove item from cart
 * @param {string|number} productId - Product ID to remove
 * @returns {Promise<Array>} Updated cart
 */
export const removeFromCart = async (productId) => {
    const userId = getCurrentUserId();
    const productIdStr = String(productId);

    try {
        const cart = await getCartItems();
        const updatedCart = cart.filter(item => String(item.id) !== productIdStr);

        if (userId) {
            await db().ref(`pharmacyCart/${userId}/${productIdStr}`).remove();
        }

        await AsyncStorage.setItem(LOCAL_KEYS.CART_CACHE, JSON.stringify(updatedCart));
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
    const userId = getCurrentUserId();
    const productIdStr = String(productId);

    try {
        const cart = await getCartItems();
        const updatedCart = cart.map(item => {
            if (String(item.id) === productIdStr) {
                const newQty = Math.max(1, (item.qty || 1) + delta);
                return { ...item, qty: newQty };
            }
            return item;
        });

        if (userId) {
            await saveCartToFirebase(updatedCart);
        }

        await AsyncStorage.setItem(LOCAL_KEYS.CART_CACHE, JSON.stringify(updatedCart));
        return updatedCart;
    } catch (error) {
        console.error('Error updating quantity:', error);
        return await getCartItems();
    }
};

/**
 * Clear all cart items
 * @returns {Promise<boolean>}
 */
export const clearCart = async () => {
    const userId = getCurrentUserId();

    try {
        if (userId) {
            await db().ref(`pharmacyCart/${userId}`).remove();
        }
        await AsyncStorage.removeItem(LOCAL_KEYS.CART_CACHE);
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
        return cart.reduce((sum, item) => {
            const qty = parseInt(item.qty) || 0;
            return sum + qty;
        }, 0);
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
        const subtotal = cart.reduce((sum, item) => {
            const price = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/[^\d.]/g, ''))
                : (parseFloat(item.price) || 0);
            const qty = parseInt(item.qty) || 0;
            return sum + (price * qty);
        }, 0);

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

// =====================================================
// ORDER FUNCTIONS
// =====================================================

/**
 * Create a new pharmacy order
 * @param {object} orderData - Order details
 * @returns {Promise<{success: boolean, orderId?: string, error?: string}>}
 */
export const createPharmacyOrder = async (orderData) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const cart = await getCartItems();
        const totals = await getCartTotal();

        const order = {
            userId,
            items: cart,
            subtotal: totals.subtotal,
            taxes: totals.taxes,
            total: totals.total,
            status: 'pending',
            pharmacy: orderData.pharmacy || { name: 'MediqZy Pharmacy' },
            deliveryAddress: orderData.deliveryAddress || {},
            paymentMethod: orderData.paymentMethod || 'COD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to Firebase
        const orderRef = await db().ref(`orders/${userId}`).push(order);
        const orderId = orderRef.key;

        // Create notification
        await createNotification(userId, {
            type: 'order',
            title: 'Order Placed Successfully',
            message: `Your order #${orderId.slice(-8).toUpperCase()} has been placed.`,
            data: { orderId },
        });

        // Clear cart after order
        await clearCart();

        return { success: true, orderId };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's pharmacy orders
 * @param {number} limit - Maximum number of orders to fetch
 * @returns {Promise<{success: boolean, orders?: array, error?: string}>}
 */
export const getPharmacyOrders = async (limit = 50) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in', orders: [] };
    }

    try {
        const snapshot = await db()
            .ref(`orders/${userId}`)
            .orderByChild('createdAt')
            .limitToLast(limit)
            .once('value');

        if (snapshot.exists()) {
            const data = snapshot.val();
            const orders = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            // Sort newest first
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { success: true, orders };
        }

        return { success: true, orders: [] };
    } catch (error) {
        console.error('Error getting orders:', error);
        return { success: false, error: error.message, orders: [] };
    }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateOrderStatus = async (orderId, status) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`orders/${userId}/${orderId}`).update({
            status,
            updatedAt: new Date().toISOString(),
        });

        // Create notification based on status
        const statusMessages = {
            processing: 'Your order is being prepared.',
            dispatched: 'Your order is on the way!',
            delivered: 'Your order has been delivered.',
            cancelled: 'Your order has been cancelled.',
        };

        if (statusMessages[status]) {
            await createNotification(userId, {
                type: 'order',
                title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: statusMessages[status],
                data: { orderId },
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const cancelOrder = async (orderId, reason = '') => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`orders/${userId}/${orderId}`).update({
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
        });

        await createNotification(userId, {
            type: 'order',
            title: 'Order Cancelled',
            message: 'Your order has been cancelled successfully.',
            data: { orderId },
        });

        return { success: true };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// FAVORITES FUNCTIONS
// =====================================================

/**
 * Add product to favorites
 * @param {object} product - Product to add
 */
export const addToFavorites = async (product) => {
    const userId = getCurrentUserId();
    if (!userId) return { success: false };

    const productId = String(product.id || Date.now());

    try {
        await db()
            .ref(`pharmacyFavorites/${userId}/${productId}`)
            .set({
                id: productId,
                name: product.name || 'Unknown Product',
                price: product.price || 0,
                desc: product.desc || product.description || '',
                imageName: product.imageName || 'drug1.png',
                image: typeof product.image === 'object' ? null : product.image,
                addedAt: new Date().toISOString(),
            });
        return { success: true };
    } catch (error) {
        console.error('Error adding to favorites:', error);
        return { success: false };
    }
};

/**
 * Remove product from favorites
 * @param {string} productId - Product ID to remove
 */
export const removeFromFavorites = async (productId) => {
    const userId = getCurrentUserId();
    if (!userId) return { success: false };

    try {
        await db()
            .ref(`pharmacyFavorites/${userId}/${productId}`)
            .remove();
        return { success: true };
    } catch (error) {
        console.error('Error removing from favorites:', error);
        return { success: false };
    }
};

/**
 * Get user's favorite products
 */
export const getFavorites = async () => {
    const userId = getCurrentUserId();
    if (!userId) return [];

    try {
        const snapshot = await db()
            .ref(`pharmacyFavorites/${userId}`)
            .once('value');

        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
        }
        return [];
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
};

/**
 * Check if product is in favorites
 * @param {string} productId - Product ID to check
 */
export const isInFavorites = async (productId) => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        const snapshot = await db()
            .ref(`pharmacyFavorites/${userId}/${productId}`)
            .once('value');
        return snapshot.exists();
    } catch (error) {
        return false;
    }
};

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to cart updates
 * @param {function} callback - Callback function (items) => {}
 * @returns {function} Unsubscribe function
 */
export const subscribeToCart = (callback) => {
    const userId = getCurrentUserId();
    if (!userId) return () => { };

    const ref = db().ref(`pharmacyCart/${userId}`);
    const listener = ref.on('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const items = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            callback(items);
        } else {
            callback([]);
        }
    });

    return () => ref.off('value', listener);
};

/**
 * Subscribe to orders updates
 * @param {function} callback - Callback function (orders) => {}
 * @returns {function} Unsubscribe function
 */
export const subscribeToOrders = (callback) => {
    const userId = getCurrentUserId();
    if (!userId) return () => { };

    const ref = db().ref(`orders/${userId}`);
    const listener = ref.on('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const orders = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
            }));
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            callback(orders);
        } else {
            callback([]);
        }
    });

    return () => ref.off('value', listener);
};

// Export default
export default {
    // Cart
    getCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    subscribeToCart,

    // Orders
    createPharmacyOrder,
    getPharmacyOrders,
    updateOrderStatus,
    cancelOrder,
    subscribeToOrders,

    // Favorites
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    isInFavorites,
};
