/**
 * Firebase Lab Tests Storage Service
 * 
 * Manages lab test cart, bookings, and orders using Firebase
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
    LAB_CART_CACHE: '@firebase_lab_cart',
    LAB_BOOKINGS_CACHE: '@firebase_lab_bookings',
};

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
// LAB TEST CART FUNCTIONS
// =====================================================

/**
 * Get lab test cart items
 * @returns {Promise<Array>} Cart items array
 */
export const getLabCartItems = async () => {
    const userId = getCurrentUserId();

    try {
        if (userId) {
            try {
                const snapshot = await db()
                    .ref(`labCart/${userId}`)
                    .once('value');

                if (snapshot && snapshot.exists()) {
                    const data = snapshot.val();
                    const items = [];

                    if (data && typeof data === 'object') {
                        Object.entries(data).forEach(([key, value]) => {
                            if (value && typeof value === 'object' && value.name) {
                                items.push({
                                    id: String(key),
                                    ...value,
                                });
                            }
                        });
                    }

                    await AsyncStorage.setItem(LOCAL_KEYS.LAB_CART_CACHE, JSON.stringify(items));
                    console.log(`Lab cart fetched: ${items.length} items`);
                    return items;
                }
            } catch (cloudError) {
                console.warn('Cloud lab cart fetch failed:', cloudError.message);
            }
        }

        // Fallback to local cache
        const localData = await AsyncStorage.getItem(LOCAL_KEYS.LAB_CART_CACHE);
        if (localData) {
            const items = JSON.parse(localData);
            return Array.isArray(items) ? items : [];
        }
        return [];
    } catch (error) {
        console.warn('Error in getLabCartItems:', error.message);
        return [];
    }
};

/**
 * Add lab test to cart
 * @param {Object} test - Test to add
 * @returns {Promise<{success: boolean, cart: Array, message: string}>}
 */
export const addToLabCart = async (test) => {
    const userId = getCurrentUserId();
    const testId = String(test.id || Date.now());

    // Validate test data
    if (!test.name || test.name === 'undefined' || test.name === 'NaN') {
        console.warn('Invalid test data, skipping add to cart');
        return { success: false, cart: [], message: 'Invalid test data' };
    }

    try {
        let cart = await getLabCartItems();

        // Filter out any invalid items
        cart = cart.filter(item =>
            item &&
            item.id &&
            item.name &&
            item.name !== 'undefined' &&
            item.name !== 'NaN' &&
            !isNaN(item.price)
        );

        const existingIndex = cart.findIndex(item => String(item.id) === testId);

        let updatedCart;
        let message;

        if (existingIndex >= 0) {
            // Already in cart
            return { success: true, cart, message: 'Already in cart' };
        } else {
            // Parse and validate price
            let price = 0;
            if (typeof test.price === 'string') {
                price = parseFloat(test.price.replace(/[^\d.]/g, '')) || 0;
            } else {
                price = parseFloat(test.price) || 0;
            }

            // Add new item
            const newItem = {
                id: testId,
                name: String(test.name),
                price: price,
                testsIncluded: test.testsIncluded || 1,
                lab: test.lab || 'Apollo Labs',
                quickReports: test.quickReports || false,
                addedAt: new Date().toISOString(),
            };
            updatedCart = [...cart, newItem];
            message = 'Added to cart';
        }

        // Save locally first
        await AsyncStorage.setItem(LOCAL_KEYS.LAB_CART_CACHE, JSON.stringify(updatedCart));

        // Sync to cloud in background
        if (userId) {
            saveLabCartToFirebase(updatedCart).catch(err =>
                console.warn('Background lab cart sync failed:', err.message)
            );

            console.log(`[LabStorage] Calling createNotification for user: ${userId}`);
            try {
                console.log(`[LabStorage] Creating DB notification for test: ${test.name} (${testId})`);
                const res = await createNotification(userId, {
                    type: 'lab',
                    title: 'Lab Test Added to Cart',
                    message: `${test.name} has been added to your lab cart.`,
                    data: { testId, type: 'cart_add', cartType: 'lab' }
                });
                console.log('[LabStorage] createNotification result:', JSON.stringify(res));
            } catch (err) {
                console.warn('[LabStorage] DB notification failed:', err.message);
            }
        } else {
            console.warn('[LabStorage] No userId found, cannot create DB notification');
        }

        // Show push notification for lab cart addition
        showAddToCartNotification({
            productName: String(test.name),
            cartType: 'lab',
            quantity: 1,
        }).catch(err => console.warn('Lab notification failed:', err.message));

        return { success: true, cart: updatedCart, message };
    } catch (error) {
        console.warn('Error in addToLabCart:', error.message);
        return { success: false, cart: [], message: 'Failed to add to cart' };
    }
};

/**
 * Save lab cart to Firebase
 */
const saveLabCartToFirebase = async (cart) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const cartData = {};
        cart.forEach(item => {
            if (item && item.id && item.name) {
                cartData[item.id] = {
                    name: String(item.name),
                    price: parseFloat(item.price) || 0,
                    testsIncluded: parseInt(item.testsIncluded) || 1,
                    lab: String(item.lab || 'Apollo Labs'),
                    quickReports: !!item.quickReports,
                    addedAt: item.addedAt || new Date().toISOString(),
                };
            }
        });

        console.log('Syncing lab cart, count:', Object.keys(cartData).length);
        await db().ref(`labCart/${userId}`).set(cartData);
    } catch (error) {
        console.error('Error saving lab cart to Firebase:', error.message);
        Alert.alert('Sync Error', error.message);
    }
};

/**
 * Remove test from lab cart
 * @param {string|number} testId - Test ID to remove
 * @returns {Promise<Array>} Updated cart
 */
export const removeFromLabCart = async (testId) => {
    const userId = getCurrentUserId();
    const testIdStr = String(testId);

    try {
        const cart = await getLabCartItems();
        const updatedCart = cart.filter(item => String(item.id) !== testIdStr);

        if (userId) {
            await db().ref(`labCart/${userId}/${testIdStr}`).remove();
        }

        await AsyncStorage.setItem(LOCAL_KEYS.LAB_CART_CACHE, JSON.stringify(updatedCart));
        return updatedCart;
    } catch (error) {
        console.error('Error removing from lab cart:', error);
        return await getLabCartItems();
    }
};

/**
 * Clear all lab cart items
 * @returns {Promise<boolean>}
 */
export const clearLabCart = async () => {
    const userId = getCurrentUserId();

    try {
        if (userId) {
            await db().ref(`labCart/${userId}`).remove();
        }
        await AsyncStorage.removeItem(LOCAL_KEYS.LAB_CART_CACHE);
        return true;
    } catch (error) {
        console.error('Error clearing lab cart:', error);
        return false;
    }
};

/**
 * Get lab cart count
 * @returns {Promise<number>} Total items in cart
 */
export const getLabCartCount = async () => {
    try {
        const cart = await getLabCartItems();
        return cart.length;
    } catch (error) {
        return 0;
    }
};

/**
 * Get lab cart total
 * @returns {Promise<{subtotal: number, taxes: number, total: number}>}
 */
export const getLabCartTotal = async () => {
    try {
        const cart = await getLabCartItems();
        const subtotal = cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            return sum + price;
        }, 0);

        const taxes = Math.round(subtotal * 0.05); // 5% tax
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
// LAB BOOKING FUNCTIONS
// =====================================================

/**
 * Book lab tests
 * @param {object} bookingData - Booking details
 * @returns {Promise<{success: boolean, bookingId?: string, error?: string}>}
 */
export const bookLabTests = async (bookingData) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const cart = await getLabCartItems();
        const totals = await getLabCartTotal();

        const booking = {
            userId,
            tests: cart,
            subtotal: totals.subtotal,
            taxes: totals.taxes,
            total: totals.total,
            status: 'scheduled',
            lab: bookingData.lab || { name: 'Apollo Labs' },
            patient: bookingData.patient || {},
            address: bookingData.address || {},
            scheduledDate: bookingData.date || new Date().toISOString(),
            scheduledTime: bookingData.time || '09:00 AM',
            paymentMethod: bookingData.paymentMethod || 'COD',
            createdAt: new Date().toISOString(),
        };

        // Save to Firebase
        const bookingRef = await db().ref(`labBookings/${userId}`).push(booking);
        const bookingId = bookingRef.key;

        // Create notification
        await createNotification(userId, {
            type: 'lab_booking',
            title: 'Lab Test Booked',
            message: `Your lab test booking #${bookingId.slice(-8).toUpperCase()} is confirmed.`,
            data: { bookingId },
        });

        // Clear cart after booking
        await clearLabCart();

        return { success: true, bookingId };
    } catch (error) {
        console.error('Error booking lab tests:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's lab bookings (from both labBookings and labOrders)
 * @param {number} limit - Maximum number of bookings to fetch
 * @returns {Promise<{success: boolean, bookings?: array, error?: string}>}
 */
export const getLabBookings = async (limit = 50) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in', bookings: [] };
    }

    try {
        let allBookings = [];

        // Fetch from labBookings
        const bookingsSnapshot = await db()
            .ref(`labBookings/${userId}`)
            .orderByChild('createdAt')
            .limitToLast(limit)
            .once('value');

        if (bookingsSnapshot.exists()) {
            const data = bookingsSnapshot.val();
            const bookings = Object.entries(data).map(([key, value]) => ({
                id: key,
                source: 'bookings',
                ...value,
            }));
            allBookings = [...allBookings, ...bookings];
        }

        // Also fetch from labOrders (created via LabPaymentScreen)
        const ordersSnapshot = await db()
            .ref(`labOrders/${userId}`)
            .orderByChild('createdAt')
            .limitToLast(limit)
            .once('value');

        if (ordersSnapshot.exists()) {
            const data = ordersSnapshot.val();
            const orders = Object.entries(data).map(([key, value]) => ({
                id: key,
                source: 'orders',
                ...value,
            }));
            allBookings = [...allBookings, ...orders];
        }

        // Sort all by createdAt (newest first)
        allBookings.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });

        // Limit results
        allBookings = allBookings.slice(0, limit);

        return { success: true, bookings: allBookings };
    } catch (error) {
        console.error('Error getting lab bookings:', error);
        return { success: false, error: error.message, bookings: [] };
    }
};

/**
 * Cancel lab booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const cancelLabBooking = async (bookingId, reason = '') => {
    const userId = getCurrentUserId();
    if (!userId) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`labBookings/${userId}/${bookingId}`).update({
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
        });

        await createNotification(userId, {
            type: 'lab_booking',
            title: 'Lab Booking Cancelled',
            message: 'Your lab test booking has been cancelled.',
            data: { bookingId },
        });

        return { success: true };
    } catch (error) {
        console.error('Error cancelling lab booking:', error);
        return { success: false, error: error.message };
    }
};

// Export default
export default {
    // Cart
    getLabCartItems,
    addToLabCart,
    removeFromLabCart,
    clearLabCart,
    getLabCartCount,
    getLabCartTotal,

    // Bookings
    bookLabTests,
    getLabBookings,
    cancelLabBooking,
};
