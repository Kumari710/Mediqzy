/**
 * Firebase Realtime Database Service
 * 
 * Provides utility functions for reading and writing data
 * to Firebase Realtime Database.
 */

import database from '@react-native-firebase/database';
import { getCurrentUser } from './firebaseAuth';
import { scheduleAppointmentReminders, cancelAppointmentReminders, updateAppointmentReminders } from './localNotifications';

const DB_URL = 'https://mediczy-624ed-default-rtdb.asia-southeast1.firebasedatabase.app/';

// Force use of the regional database URL
const databaseInstance = database().app.database(DB_URL);

// Monitor connection state
databaseInstance.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log('[Firebase] Connected to Database:', DB_URL);
    } else {
        console.log('[Firebase] Connection lost/disconnected');
    }
});

// Enable persistence for better performance and offline support
// DISABLED TEMPORARILY TO TROUBLESHOOT SYNC ISSUES
try {
    // databaseInstance.setPersistenceEnabled(true);
    // databaseInstance.setPersistenceCacheSizeBytes(10000000); // 10MB cache
    console.log('[Firebase] Persistence disabled for troubleshooting');
} catch (e) {
    console.log('Firebase Persistence error:', e.message);
}

// Log current user for debugging
const user = getCurrentUser();
if (user) {
    console.log('[Firebase] Active Session for User ID:', user.uid);
}

export const db = () => databaseInstance;

// =====================================================
// DATABASE REFERENCE UTILITIES
// =====================================================

/**
 * Get a reference to a specific path in the database
 * @param {string} path - Database path (e.g., 'users' or 'users/userId')
 * @returns {DatabaseReference}
 */
export const getRef = (path) => {
    return db().ref(path);
};

/**
 * Get current user's data reference
 * @param {string} subPath - Optional sub-path under the user's data
 * @returns {DatabaseReference|null}
 */
export const getUserRef = (subPath = '') => {
    const user = getCurrentUser();
    if (!user) return null;
    const path = subPath ? `users/${user.uid}/${subPath}` : `users/${user.uid}`;
    return db().ref(path);
};

// =====================================================
// WRITE OPERATIONS
// =====================================================

/**
 * Set data at a specific path (overwrites existing data)
 * @param {string} path - Database path
 * @param {any} data - Data to write
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const setData = async (path, data) => {
    try {
        await db().ref(path).set(data);
        return { success: true };
    } catch (error) {
        console.error('Firebase setData error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update data at a specific path (merges with existing data)
 * @param {string} path - Database path
 * @param {object} data - Data to update/merge
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateData = async (path, data) => {
    try {
        await db().ref(path).update(data);
        return { success: true };
    } catch (error) {
        console.error('Firebase updateData error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Push new data to a list (auto-generates unique key)
 * @param {string} path - Database path
 * @param {any} data - Data to push
 * @returns {Promise<{success: boolean, key?: string, error?: string}>}
 */
export const pushData = async (path, data) => {
    try {
        console.log(`[Firebase] Pushing data to: ${path}`);
        const ref = db().ref(path);
        const newRef = ref.push();
        await newRef.set(data);
        console.log(`[Firebase] Push success, new key: ${newRef.key}`);
        return { success: true, key: newRef.key };
    } catch (error) {
        console.error(`[Firebase] pushData error at ${path}:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Remove data at a specific path
 * @param {string} path - Database path
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeData = async (path) => {
    try {
        await db().ref(path).remove();
        return { success: true };
    } catch (error) {
        console.error('Firebase removeData error:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Read data once from a specific path
 * @param {string} path - Database path
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const getData = async (path) => {
    try {
        const snapshot = await db().ref(path).once('value');
        return { success: true, data: snapshot.val() };
    } catch (error) {
        console.error('Firebase getData error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to data changes at a specific path
 * @param {string} path - Database path
 * @param {function} callback - Callback function (data) => {}
 * @returns {function} Unsubscribe function
 */
export const onDataChange = (path, callback) => {
    console.log(`[Firebase] Subscribing to: ${path}`);
    const ref = db().ref(path);

    const listener = ref.on('value', (snapshot) => {
        console.log(`[Firebase] Data received for ${path}:`, snapshot.exists() ? 'Has data' : 'No data');
        callback(snapshot.val());
    }, (error) => {
        console.error(`[Firebase] onDataChange error for ${path}:`, error);
        callback(null);
    });

    // Return unsubscribe function
    return () => {
        console.log(`[Firebase] Unsubscribing from: ${path}`);
        ref.off('value', listener);
    };
};

/**
 * Subscribe to child added events
 * @param {string} path - Database path
 * @param {function} callback - Callback function (child data, key) => {}
 * @returns {function} Unsubscribe function
 */
export const onChildAdded = (path, callback) => {
    const ref = db().ref(path);
    const listener = ref.on('child_added', (snapshot) => {
        callback(snapshot.val(), snapshot.key);
    });

    return () => ref.off('child_added', listener);
};

// =====================================================
// ADDRESS OPERATIONS
// =====================================================

/**
 * Get all addresses for the current user
 */
export const getAddresses = async () => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const snapshot = await db().ref(`users/${user.uid}/addresses`).once('value');
        const data = snapshot.val();
        const addresses = data ? Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
        })) : [];
        return { success: true, data: addresses };
    } catch (error) {
        console.error('Firebase getAddresses error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Save a new address
 */
export const saveAddress = async (addressData) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const ref = db().ref(`users/${user.uid}/addresses`);
        const newRef = ref.push();
        const isFirst = (await ref.once('value')).numChildren() === 1;

        await newRef.set({
            ...addressData,
            isDefault: isFirst,
            createdAt: new Date().toISOString()
        });
        return { success: true, key: newRef.key };
    } catch (error) {
        console.error('Firebase saveAddress error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update existing address
 */
export const updateAddress = async (addressId, addressData) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        await db().ref(`users/${user.uid}/addresses/${addressId}`).update(addressData);
        return { success: true };
    } catch (error) {
        console.error('Firebase updateAddress error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        await db().ref(`users/${user.uid}/addresses/${addressId}`).remove();
        return { success: true };
    } catch (error) {
        console.error('Firebase deleteAddress error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Set selected/default address
 */
export const setSelectedAddress = async (addressId) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const ref = db().ref(`users/${user.uid}/addresses`);
        const snapshot = await ref.once('value');
        const updates = {};

        snapshot.forEach((child) => {
            updates[`${child.key}/isDefault`] = child.key === addressId;
        });

        await ref.update(updates);
        return { success: true };
    } catch (error) {
        console.error('Firebase setSelectedAddress error:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// PATIENT OPERATIONS
// =====================================================

/**
 * Get all patients for the current user
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export const getPatients = async () => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const snapshot = await db().ref(`users/${user.uid}/patients`).once('value');
        const data = snapshot.val();
        const patients = data ? Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
        })) : [];
        return { success: true, data: patients };
    } catch (error) {
        console.error('Firebase getPatients error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Save a new patient
 * @param {object} patientData - Patient details
 * @returns {Promise<{success: boolean, key?: string, error?: string}>}
 */
export const savePatient = async (patientData) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const ref = db().ref(`users/${user.uid}/patients`);
        const newRef = ref.push();
        await newRef.set({
            ...patientData,
            createdAt: new Date().toISOString()
        });
        return { success: true, key: newRef.key };
    } catch (error) {
        console.error('Firebase savePatient error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update existing patient
 */
export const updatePatient = async (patientId, patientData) => {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        await db().ref(`users/${user.uid}/patients/${patientId}`).update(patientData);
        return { success: true };
    } catch (error) {
        console.error('Firebase updatePatient error:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// APPOINTMENT OPERATIONS
// =====================================================

/**
 * Save current user's profile data
 * @param {object} profileData - User profile data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveUserProfile = async (profileData) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`users/${user.uid}/profile`).update({
            ...profileData,
            updatedAt: database.ServerValue.TIMESTAMP,
        });
        return { success: true };
    } catch (error) {
        console.error('Firebase saveUserProfile error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get any order by its custom order ID
 */
export const getOrderById = async (orderId) => {
    try {
        const snapshot = await db().ref('allOrders').orderByChild('orderId').equalTo(orderId).once('value');
        const data = snapshot.val();
        if (data) {
            // EqualTo returns an object with keys, get the first one
            const key = Object.keys(data)[0];
            return { success: true, data: data[key] };
        }
        return { success: false, error: 'Order not found' };
    } catch (error) {
        console.error('Firebase getOrderById error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current user's profile data
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUserProfile = async () => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    return getData(`users/${user.uid}/profile`);
};

/**
 * Subscribe to current user's profile changes
 * @param {function} callback - Callback function (profileData) => {}
 * @returns {function|null} Unsubscribe function or null if not logged in
 */
export const onUserProfileChange = (callback) => {
    const user = getCurrentUser();
    if (!user) return null;

    return onDataChange(`users/${user.uid}/profile`, callback);
};

// =====================================================
// QUERY OPERATIONS
// =====================================================

/**
 * Query data with ordering and limiting
 * @param {string} path - Database path
 * @param {object} options - Query options
 * @param {string} options.orderBy - Field to order by ('key', 'value', or field name)
 * @param {number} options.limit - Limit number of results
 * @param {boolean} options.limitToLast - If true, get last N items instead of first
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const queryData = async (path, options = {}) => {
    try {
        let ref = db().ref(path);

        if (options.orderBy) {
            if (options.orderBy === 'key') {
                ref = ref.orderByKey();
            } else if (options.orderBy === 'value') {
                ref = ref.orderByValue();
            } else {
                ref = ref.orderByChild(options.orderBy);
            }
        }

        if (options.limit) {
            ref = options.limitToLast
                ? ref.limitToLast(options.limit)
                : ref.limitToFirst(options.limit);
        }

        const snapshot = await ref.once('value');
        const result = [];
        snapshot.forEach((child) => {
            result.push({ key: child.key, ...child.val() });
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Firebase queryData error:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// ORDER MANAGEMENT
// =====================================================

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status ('pending', 'processing', 'dispatched', 'delivered', 'cancelled')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateOrderStatus = async (orderId, status) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const updateObj = {
            status,
            updatedAt: database.ServerValue.TIMESTAMP,
        };

        console.log(`[Firebase] Updating status for ${orderId} to ${status}`);

        // Helper to update by custom ID if key lookup fails
        const updateByQuery = async (path) => {
            const snap = await db().ref(path).orderByChild('orderId').equalTo(orderId).once('value');
            if (snap.exists()) {
                const updates = {};
                snap.forEach(child => {
                    updates[child.key] = { ...child.val(), ...updateObj };
                });
                await db().ref(path).update(updates);
                return true;
            }
            return false;
        };

        // 1. Try Direct Key Lookup (Fastest)
        const paths = [
            `labOrders/${user.uid}/${orderId}`,
            `pharmacyOrders/${user.uid}/${orderId}`,
            `appointments/${user.uid}/${orderId}`,
            `orders/${user.uid}/${orderId}`
        ];

        let updated = false;
        for (const path of paths) {
            const snap = await db().ref(path).once('value');
            if (snap.exists()) {
                await db().ref(path).update(updateObj);
                updated = true;
                break;
            }
        }

        // 2. Try Query by orderId if direct lookup failed
        if (!updated) {
            const queryPaths = [
                `labOrders/${user.uid}`,
                `pharmacyOrders/${user.uid}`,
                `appointments/${user.uid}`
            ];
            for (const path of queryPaths) {
                if (await updateByQuery(path)) {
                    updated = true;
                    break;
                }
            }
        }

        // 3. Always update in global allOrders
        await db().ref('allOrders').orderByChild('orderId').equalTo(orderId).once('value', snapshot => {
            snapshot.forEach(child => {
                child.ref.update(updateObj);
            });
        });

        // 4. Also check id field in allOrders
        await db().ref('allOrders').orderByKey().equalTo(orderId).once('value', snapshot => {
            snapshot.forEach(child => {
                child.ref.update(updateObj);
            });
        });

        return { success: true };
    } catch (error) {
        console.error('Firebase updateOrderStatus error:', error);
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
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const cancelObj = {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: database.ServerValue.TIMESTAMP,
        };

        // Try pharmacyOrders first
        const snap = await db().ref(`pharmacyOrders/${user.uid}/${orderId}`).once('value');
        if (snap.exists()) {
            await db().ref(`pharmacyOrders/${user.uid}/${orderId}`).update(cancelObj);
        } else {
            // Try labOrders
            const labSnap = await db().ref(`labOrders/${user.uid}/${orderId}`).once('value');
            if (labSnap.exists()) {
                await db().ref(`labOrders/${user.uid}/${orderId}`).update(cancelObj);
            } else {
                // Fallback to legacy orders path
                await db().ref(`orders/${user.uid}/${orderId}`).update(cancelObj);
            }
        }

        // Also update in global allOrders
        await db().ref(`allOrders`).orderByChild('orderId').equalTo(orderId).once('value', snapshot => {
            snapshot.forEach(child => {
                child.ref.update(cancelObj);
            });
        });

        return { success: true };
    } catch (error) {
        console.error('Firebase cancelOrder error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's orders (combined pharmacy and lab)
 * @param {number} limit - Maximum number of orders to fetch
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getUserOrders = async (limit = 50) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const [pharmacyRes, labRes] = await Promise.all([
            queryData(`pharmacyOrders/${user.uid}`, { orderBy: 'createdAt', limitToLast: true, limit }),
            queryData(`labOrders/${user.uid}`, { orderBy: 'createdAt', limitToLast: true, limit })
        ]);

        const combined = [];
        if (pharmacyRes.success && pharmacyRes.data) {
            pharmacyRes.data.forEach(order => combined.push({ ...order, type: 'pharmacy' }));
        }
        if (labRes.success && labRes.data) {
            labRes.data.forEach(order => combined.push({ ...order, type: 'lab' }));
        }

        // Sort combined list by date (newest first)
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return { success: true, data: combined };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// =====================================================
// NOTIFICATION MANAGEMENT
// =====================================================

/**
 * Create a notification for the user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 * @returns {Promise<{success: boolean, key?: string, error?: string}>}
 */
export const createNotification = async (userId, notification) => {
    try {
        if (!userId) {
            console.warn('[Firebase] createNotification failed: No userId provided');
            return { success: false, error: 'No userId provided' };
        }
        const notifData = {
            ...notification,
            read: false,
            createdAt: new Date().toISOString(),
        };
        console.log(`[Firebase] Creating notification for user: ${userId}`);
        const result = await pushData(`notifications/${userId}`, notifData);
        return result;
    } catch (error) {
        console.error('[Firebase] createNotification error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create order status notification
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 */
export const createOrderNotification = async (orderId, status) => {
    const user = getCurrentUser();
    if (!user) return;

    const statusMessages = {
        processing: { title: 'Order Confirmed', message: 'Your order is being prepared.' },
        dispatched: { title: 'Order Shipped', message: 'Your order is on the way!' },
        delivered: { title: 'Order Delivered', message: 'Your order has been delivered successfully.' },
        cancelled: { title: 'Order Cancelled', message: 'Your order has been cancelled.' },
    };

    const info = statusMessages[status];
    if (!info) return;

    await createNotification(user.uid, {
        type: 'order',
        title: info.title,
        message: info.message,
        data: { orderId },
    });
};

// =====================================================
// APPOINTMENT MANAGEMENT
// =====================================================

/**
 * Save a new appointment
 * @param {object} appointmentData - Appointment details
 * @returns {Promise<{success: boolean, key?: string, error?: string}>}
 */
export const saveAppointment = async (appointmentData) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const appointment = {
            userId: user.uid,
            userEmail: user.email,
            ...appointmentData,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
        };

        // Save to user's appointments (single source of truth)
        const result = await pushData(`appointments/${user.uid}`, appointment);

        if (result.success) {
            const appointmentId = result.key;
            // Store appointmentId for reference
            await db().ref(`appointments/${user.uid}/${appointmentId}`).update({
                appointmentId: appointmentId,
            });

            // ADD TO centralized allOrders for unified lookup
            await pushData('allOrders', {
                ...appointment,
                id: appointmentId,
                orderId: appointmentId, // Using the key as orderId for appointments
                orderType: 'consultation',
                total: appointmentData.totalAmount || appointmentData.fee || 0
            });

            // Create notification
            await createNotification(user.uid, {
                type: 'appointment',
                title: 'Appointment Booked',
                message: `Your appointment with ${appointmentData.doctor?.name || appointmentData.doctor || 'Doctor'} is confirmed for ${appointmentData.date} at ${appointmentData.time}`,
                data: { appointmentId: appointmentId },
            });

            // Schedule appointment reminders (1 hour before and 1 day before)
            await scheduleAppointmentReminders({
                id: result.key,
                date: appointmentData.date,
                time: appointmentData.time,
                doctor: appointmentData.doctor,
            });
        }

        return result;
    } catch (error) {
        console.error('Firebase saveAppointment error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Helper to check if an appointment is in the future based on its date and time
 * @param {object} appt - Appointment object with date (DD.MM.YY) and time (HH:MM AM/PM)
 * @returns {boolean}
 */
export function isFutureAppointment(appt) {
    if (!appt || !appt.date || !appt.time) return false;

    // Status check - explicitly completed/cancelled are NEVER upcoming
    const status = (appt.status || '').toLowerCase();
    if (status === 'completed' || status === 'cancelled') {
        return false;
    }

    try {
        // Parse date: handle both DD.MM.YY and DD/MM/YY
        const normalizedDate = appt.date.replace(/\//g, '.');
        const dateParts = normalizedDate.split('.');

        let apptDate;

        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]);
            const yearShort = parseInt(dateParts[2]);
            const year = yearShort < 100 ? 2000 + yearShort : yearShort;

            // Parse time: HH:MM AM/PM (e.g., 11:00 AM)
            const timeParts = appt.time.split(' ');
            let hours = 0;
            let minutes = 0;

            if (timeParts.length >= 1) {
                const [timeStr, period] = timeParts;
                const [hourStr, minuteStr] = timeStr.split(':');
                hours = parseInt(hourStr);
                minutes = parseInt(minuteStr) || 0;

                if (period?.toUpperCase() === 'PM' && hours !== 12) hours += 12;
                if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
            }

            apptDate = new Date(year, month - 1, day, hours, minutes);
        } else {
            // Try regular Date parsing for formats like "30 Jan 2026"
            apptDate = new Date(`${appt.date} ${appt.time}`);
        }

        const now = new Date();

        if (isNaN(apptDate.getTime())) {
            throw new Error('Invalid Date');
        }

        return apptDate >= now;
    } catch (e) {
        // Fallback to status if parsing fails
        return status === 'upcoming' || status === 'Online' || status === 'Offline';
    }
};

/**
 * Get user's appointments
 * @param {number} limit - Maximum number of appointments to fetch
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getUserAppointments = async (limit = 50) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    return queryData(`appointments/${user.uid}`, { orderBy: 'createdAt', limitToLast: true, limit });
};

/**
 * Get only upcoming appointments for the user
 */
export const getUpcomingAppointments = async (limit = 20) => {
    const result = await getUserAppointments(limit);
    if (result.success && result.data) {
        const filtered = result.data.filter(isFutureAppointment);
        // Sort by date ascending (soonest first if we could, but createdAt is decent for now)
        return { success: true, data: filtered };
    }
    return result;
};

/**
 * Get only past appointments for the user
 */
export const getPastAppointments = async (limit = 50) => {
    const result = await getUserAppointments(limit);
    if (result.success && result.data) {
        const filtered = result.data.filter(appt => !isFutureAppointment(appt));
        return { success: true, data: filtered };
    }
    return result;
};

/**
 * Get ALL appointments from all users (for admin/doctor view)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getAllAppointments = async () => {
    try {
        const snapshot = await db().ref('appointments').once('value');
        const allAppointments = [];

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            // Iterate through each user's appointments
            Object.keys(usersData).forEach((userId) => {
                const userAppointments = usersData[userId];
                if (userAppointments && typeof userAppointments === 'object') {
                    Object.entries(userAppointments).forEach(([appointmentId, appointment]) => {
                        allAppointments.push({
                            id: appointmentId,
                            userId: userId,
                            ...appointment,
                        });
                    });
                }
            });
            // Sort by createdAt (newest first)
            allAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return { success: true, data: allAppointments };
    } catch (error) {
        console.error('Firebase getAllAppointments error:', error);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Subscribe to ALL appointments changes (for admin/doctor real-time view)
 * @param {function} callback - Callback function (appointments) => {}
 * @returns {function} Unsubscribe function
 */
export const onAllAppointmentsChange = (callback) => {
    const ref = db().ref('appointments');
    const listener = ref.on('value', (snapshot) => {
        const allAppointments = [];

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            Object.keys(usersData).forEach((userId) => {
                const userAppointments = usersData[userId];
                if (userAppointments && typeof userAppointments === 'object') {
                    Object.entries(userAppointments).forEach(([appointmentId, appointment]) => {
                        allAppointments.push({
                            id: appointmentId,
                            ...appointment,
                        });
                    });
                }
            });
            allAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        callback(allAppointments);
    });

    return () => ref.off('value', listener);
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment ID
 * @param {string} status - New status ('upcoming', 'completed', 'cancelled')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`appointments/${user.uid}/${appointmentId}`).update({
            status,
            updatedAt: database.ServerValue.TIMESTAMP,
        });
        return { success: true };
    } catch (error) {
        console.error('Firebase updateAppointmentStatus error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const cancelAppointment = async (appointmentId, reason = '') => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        await db().ref(`appointments/${user.uid}/${appointmentId}`).update({
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: database.ServerValue.TIMESTAMP,
        });

        // Cancel scheduled reminders
        await cancelAppointmentReminders(appointmentId);

        // Create cancellation notification
        await createNotification(user.uid, {
            type: 'appointment',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled successfully.',
            data: { appointmentId },
        });

        return { success: true };
    } catch (error) {
        console.error('Firebase cancelAppointment error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Reschedule an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {object} newSchedule - New date and time
 * @param {string} newSchedule.date - New date
 * @param {string} newSchedule.time - New time
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const rescheduleAppointment = async (appointmentId, newSchedule) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        // Get current appointment data
        const snapshot = await db().ref(`appointments/${user.uid}/${appointmentId}`).once('value');
        const currentAppointment = snapshot.val();

        if (!currentAppointment) {
            return { success: false, error: 'Appointment not found' };
        }

        const oldDate = currentAppointment.date;
        const oldTime = currentAppointment.time;

        // Update appointment with new schedule
        await db().ref(`appointments/${user.uid}/${appointmentId}`).update({
            date: newSchedule.date,
            time: newSchedule.time,
            previousDate: oldDate,
            previousTime: oldTime,
            rescheduledAt: new Date().toISOString(),
        });

        // Cancel old reminders and schedule new ones
        await updateAppointmentReminders({
            id: appointmentId,
            date: newSchedule.date,
            time: newSchedule.time,
            doctor: currentAppointment.doctor,
            status: 'upcoming',
        });

        // Create reschedule notification
        await createNotification(user.uid, {
            type: 'appointment',
            title: 'Appointment Rescheduled',
            message: `Your appointment has been rescheduled to ${newSchedule.date} at ${newSchedule.time}`,
            data: { appointmentId },
        });

        return { success: true };
    } catch (error) {
        console.error('Firebase rescheduleAppointment error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create appointment status notification
 * @param {string} appointmentId - Appointment ID
 * @param {string} status - New appointment status
 * @param {object} doctorInfo - Doctor information
 */
export const createAppointmentNotification = async (appointmentId, status, doctorInfo = {}) => {
    const user = getCurrentUser();
    if (!user) return;

    const statusMessages = {
        upcoming: { title: 'Appointment Confirmed', message: `Your appointment with ${doctorInfo.name || 'Doctor'} is confirmed.` },
        completed: { title: 'Appointment Completed', message: 'Thank you for your visit. We hope you had a great experience!' },
        cancelled: { title: 'Appointment Cancelled', message: 'Your appointment has been cancelled.' },
    };

    const info = statusMessages[status];
    if (!info) return;
    await createNotification(user.uid, {
        type: 'appointment',
        title: info.title,
        message: info.message,
        data: { appointmentId },
    });
};

/**
 * Save a generated bill to the database
 * @param {string} orderId - The ID of the order
 * @param {object} billData - The bill details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveBill = async (orderId, billData) => {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('User not logged in');

        // Store bill metadata and reference
        await getRef(`bills/${orderId}`).set({
            ...billData,
            userId: user.uid,
            createdAt: new Date().toISOString(),
        });

        // Update order with bill reference
        await getRef(`orders/${user.uid}/${orderId}/billId`).set(orderId);

        return { success: true };
    } catch (error) {
        console.error('Firebase saveBill error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get bill for a specific order
 * @param {string} orderId - The ID of the order
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getBillByOrderId = async (orderId) => {
    try {
        const snapshot = await getRef(`bills/${orderId}`).once('value');
        if (snapshot.exists()) {
            return { success: true, data: snapshot.val() };
        }
        return { success: false, error: 'Bill not found' };
    } catch (error) {
        console.error('Firebase getBillByOrderId error:', error);
        return { success: false, error: error.message };
    }
};

// Export default object with all functions
export default {
    getRef,
    getUserRef,
    setData,
    updateData,
    pushData,
    removeData,
    getData,
    onDataChange,
    onChildAdded,
    saveUserProfile,
    getUserProfile,
    getOrderById,
    isFutureAppointment,
    getUpcomingAppointments,
    getPastAppointments,
    onUserProfileChange,
    queryData,
    updateOrderStatus,
    cancelOrder,
    getUserOrders,
    createNotification,
    createOrderNotification,
    savePatient,
    getPatients,
    updatePatient,
    saveAppointment,
    getUserAppointments,
    getAllAppointments,
    onAllAppointmentsChange,
    updateAppointmentStatus,
    cancelAppointment,
    rescheduleAppointment,
    createAppointmentNotification,
    saveBill,
    getBillByOrderId,
};

