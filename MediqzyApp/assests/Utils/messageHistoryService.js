/**
 * Message History Service
 * 
 * Persists all user communications (notifications, reminders, updates)
 * in a user-visible message history linked to orders
 * 
 * Provides a unified communication log for the user
 */

import database from '@react-native-firebase/database';
import { getCurrentUser } from './firebaseAuth';
import { pushData, getData, updateData } from './firebaseDatabase';

// =====================================================
// MESSAGE TYPES
// =====================================================

export const MESSAGE_TYPES = {
    // Booking & Order
    BOOKING_CONFIRMATION: 'booking_confirmation',
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_PROCESSING: 'order_processing',
    ORDER_COMPLETED: 'order_completed',
    ORDER_CANCELLED: 'order_cancelled',
    ORDER_RESCHEDULED: 'order_rescheduled',

    // Payment
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    PAYMENT_REFUND: 'payment_refund',

    // Reminders
    APPOINTMENT_REMINDER: 'appointment_reminder',
    LAB_REMINDER: 'lab_reminder',
    PRESCRIPTION_REMINDER: 'prescription_reminder',
    MEDICINE_REMINDER: 'medicine_reminder',

    // Reports & Results
    REPORT_READY: 'report_ready',
    PRESCRIPTION_READY: 'prescription_ready',
    LAB_REPORT_AVAILABLE: 'lab_report_available',

    // Consultation
    CONSULTATION_STARTED: 'consultation_started',
    CONSULTATION_COMPLETED: 'consultation_completed',
    DOCTOR_MESSAGE: 'doctor_message',

    // Delivery
    ORDER_DISPATCHED: 'order_dispatched',
    ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
    ORDER_DELIVERED: 'order_delivered',

    // System
    PROMOTIONAL: 'promotional',
    SYSTEM_UPDATE: 'system_update',
    ACCOUNT_UPDATE: 'account_update',
};

export const MESSAGE_CATEGORIES = {
    ORDERS: 'orders',
    APPOINTMENTS: 'appointments',
    REMINDERS: 'reminders',
    REPORTS: 'reports',
    PROMOTIONS: 'promotions',
    SYSTEM: 'system',
};

// =====================================================
// MESSAGE DATA MODEL
// =====================================================

/**
 * Create a standardized message object
 * @param {object} messageData - Message details
 * @returns {object} Standardized message object
 */
const createMessageObject = (messageData) => {
    const now = new Date().toISOString();

    return {
        // Core fields
        id: messageData.id || `MSG${Date.now()}${Math.random().toString(36).substring(2, 6)}`,
        type: messageData.type || MESSAGE_TYPES.SYSTEM_UPDATE,
        category: getCategoryFromType(messageData.type),

        // Content
        title: messageData.title || 'Notification',
        message: messageData.message || '',
        shortMessage: messageData.shortMessage || messageData.message?.substring(0, 100) || '',

        // Linking
        orderId: messageData.orderId || null,
        bookingId: messageData.bookingId || null,
        orderType: messageData.orderType || null,
        appointmentId: messageData.appointmentId || null,

        // Status
        read: false,
        deleted: false,
        pinned: messageData.pinned || false,

        // Timestamps
        createdAt: now,
        expiresAt: messageData.expiresAt || null, // For time-sensitive messages

        // Additional data
        data: messageData.data || {},
        actionUrl: messageData.actionUrl || null,
        actionLabel: messageData.actionLabel || null,

        // Priority
        priority: messageData.priority || 'normal', // low, normal, high, urgent
    };
};

/**
 * Get category from message type
 */
const getCategoryFromType = (type) => {
    if (!type) return MESSAGE_CATEGORIES.SYSTEM;

    if (type.includes('order') || type.includes('booking') || type.includes('payment') ||
        type.includes('dispatch') || type.includes('deliver')) {
        return MESSAGE_CATEGORIES.ORDERS;
    }
    if (type.includes('appointment') || type.includes('consultation') || type.includes('doctor')) {
        return MESSAGE_CATEGORIES.APPOINTMENTS;
    }
    if (type.includes('reminder')) {
        return MESSAGE_CATEGORIES.REMINDERS;
    }
    if (type.includes('report') || type.includes('prescription') || type.includes('lab')) {
        return MESSAGE_CATEGORIES.REPORTS;
    }
    if (type.includes('promotional')) {
        return MESSAGE_CATEGORIES.PROMOTIONS;
    }
    return MESSAGE_CATEGORIES.SYSTEM;
};

// =====================================================
// SAVE & RETRIEVE MESSAGES
// =====================================================

/**
 * Save a message to user's message history
 * @param {object} messageData - Message details
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const saveUserMessage = async (messageData) => {
    const user = getCurrentUser();
    if (!user) {
        console.warn('[MessageHistory] No user logged in');
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const message = createMessageObject(messageData);

        console.log(`[MessageHistory] Saving message: ${message.type} for order: ${message.orderId}`);

        const result = await pushData(`messages/${user.uid}`, message);

        if (result.success) {
            // Also link to order if orderId provided
            if (message.orderId) {
                await linkMessageToOrder(user.uid, result.key, message.orderId);
            }
            return { success: true, messageId: result.key };
        }

        return result;

    } catch (error) {
        console.error('[MessageHistory] Save error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Link message to an order for cross-reference
 */
const linkMessageToOrder = async (userId, messageId, orderId) => {
    try {
        await pushData(`orderMessages/${userId}/${orderId}`, {
            messageId,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.warn('[MessageHistory] Link to order failed:', error);
    }
};

/**
 * Get all messages for current user
 * @param {object} options - Query options
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getUserMessages = async (options = {}) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const { limit = 50, category = null, unreadOnly = false } = options;

        let ref = database().ref(`messages/${user.uid}`);

        const snapshot = await ref.orderByChild('createdAt').limitToLast(limit).once('value');

        const data = snapshot.val();
        if (!data) {
            return { success: true, data: [] };
        }

        let messages = Object.entries(data)
            .map(([key, value]) => ({ ...value, firebaseKey: key }))
            .filter(msg => !msg.deleted)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Apply filters
        if (category) {
            messages = messages.filter(msg => msg.category === category);
        }
        if (unreadOnly) {
            messages = messages.filter(msg => !msg.read);
        }

        return { success: true, data: messages };

    } catch (error) {
        console.error('[MessageHistory] Get messages error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get messages for a specific order
 * @param {string} orderId - Order ID to get messages for
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getOrderMessages = async (orderId) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        // Get message IDs linked to order
        const linksSnapshot = await database()
            .ref(`orderMessages/${user.uid}/${orderId}`)
            .once('value');

        const links = linksSnapshot.val();
        if (!links) {
            return { success: true, data: [] };
        }

        // Get all messages
        const messagesResult = await getUserMessages({ limit: 100 });
        if (!messagesResult.success) {
            return messagesResult;
        }

        // Filter to only order-related messages
        const messageIds = Object.values(links).map(l => l.messageId);
        const orderMessages = messagesResult.data.filter(
            msg => messageIds.includes(msg.firebaseKey) || msg.orderId === orderId
        );

        return { success: true, data: orderMessages };

    } catch (error) {
        console.error('[MessageHistory] Get order messages error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get unread message count
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
    const result = await getUserMessages({ unreadOnly: true });
    return result.success ? result.data.length : 0;
};

/**
 * Get messages by category
 * @param {string} category - Category from MESSAGE_CATEGORIES
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getMessagesByCategory = async (category) => {
    return getUserMessages({ category });
};

// =====================================================
// MESSAGE STATUS MANAGEMENT
// =====================================================

/**
 * Mark a message as read
 * @param {string} messageId - Firebase key of the message
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markMessageAsRead = async (messageId) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        await updateData(`messages/${user.uid}/${messageId}`, {
            read: true,
            readAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Mark all messages as read
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markAllAsRead = async () => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const result = await getUserMessages({ unreadOnly: true });
        if (!result.success) return result;

        const now = new Date().toISOString();
        const updates = {};

        result.data.forEach(msg => {
            updates[`messages/${user.uid}/${msg.firebaseKey}/read`] = true;
            updates[`messages/${user.uid}/${msg.firebaseKey}/readAt`] = now;
        });

        if (Object.keys(updates).length > 0) {
            await database().ref().update(updates);
        }

        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Delete a message (soft delete)
 * @param {string} messageId - Firebase key of the message
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteMessage = async (messageId) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        await updateData(`messages/${user.uid}/${messageId}`, {
            deleted: true,
            deletedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Pin/unpin a message
 * @param {string} messageId - Firebase key of the message
 * @param {boolean} pinned - Pin status
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const togglePinMessage = async (messageId, pinned) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        await updateData(`messages/${user.uid}/${messageId}`, { pinned });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// =====================================================
// REAL-TIME SUBSCRIPTION
// =====================================================

/**
 * Subscribe to new messages
 * @param {function} callback - Callback function (messages) => {}
 * @returns {function} Unsubscribe function
 */
export const subscribeToMessages = (callback) => {
    const user = getCurrentUser();
    if (!user) {
        console.warn('[MessageHistory] No user for subscription');
        return () => { };
    }

    const ref = database().ref(`messages/${user.uid}`);

    const listener = ref.orderByChild('createdAt').limitToLast(50).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            callback([]);
            return;
        }

        const messages = Object.entries(data)
            .map(([key, value]) => ({ ...value, firebaseKey: key }))
            .filter(msg => !msg.deleted)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        callback(messages);
    });

    return () => {
        ref.off('value', listener);
    };
};

/**
 * Subscribe to unread count changes
 * @param {function} callback - Callback function (count) => {}
 * @returns {function} Unsubscribe function
 */
export const subscribeToUnreadCount = (callback) => {
    return subscribeToMessages((messages) => {
        const unreadCount = messages.filter(msg => !msg.read).length;
        callback(unreadCount);
    });
};

// =====================================================
// CONTEXTUAL MESSAGE CREATION HELPERS
// =====================================================

/**
 * Create booking confirmation message
 */
export const createBookingConfirmationMessage = async (order) => {
    const message = {
        type: MESSAGE_TYPES.BOOKING_CONFIRMATION,
        title: 'Booking Confirmed',
        message: `Your ${order.orderType} booking has been confirmed. Order ID: ${order.orderId}`,
        orderId: order.orderId,
        bookingId: order.bookingId,
        orderType: order.orderType,
        priority: 'high',
    };

    return saveUserMessage(message);
};

/**
 * Create payment success message
 */
export const createPaymentSuccessMessage = async (order, paymentDetails) => {
    const message = {
        type: MESSAGE_TYPES.PAYMENT_SUCCESS,
        title: 'Payment Successful',
        message: `Payment of ₹${order.pricing?.total || order.total || 0} for order ${order.orderId} was successful.`,
        orderId: order.orderId,
        orderType: order.orderType,
        data: {
            amount: order.pricing?.total,
            transactionId: paymentDetails.transactionId,
            paymentMethod: paymentDetails.method,
        },
        priority: 'high',
    };

    return saveUserMessage(message);
};

/**
 * Create payment failure message
 */
export const createPaymentFailureMessage = async (orderId, errorMessage) => {
    return saveUserMessage({
        type: MESSAGE_TYPES.PAYMENT_FAILED,
        title: 'Payment Failed',
        message: `Payment for order ${orderId} failed. ${errorMessage || 'Please try again.'}`,
        orderId,
        priority: 'urgent',
        actionLabel: 'Retry Payment',
    });
};

/**
 * Create appointment reminder message
 */
export const createAppointmentReminderMessage = async (appointment, timeUntil) => {
    return saveUserMessage({
        type: MESSAGE_TYPES.APPOINTMENT_REMINDER,
        title: 'Appointment Reminder',
        message: `Your appointment with ${appointment.doctor?.name || 'Doctor'} is ${timeUntil}. Don't forget to join on time!`,
        orderId: appointment.orderId,
        appointmentId: appointment.id || appointment.appointmentId,
        orderType: 'consultation',
        priority: 'high',
    });
};

/**
 * Create lab report available message
 */
export const createLabReportAvailableMessage = async (order) => {
    return saveUserMessage({
        type: MESSAGE_TYPES.LAB_REPORT_AVAILABLE,
        title: 'Lab Report Ready',
        message: `Your lab test report for order ${order.orderId} is now available. Tap to view.`,
        orderId: order.orderId,
        orderType: 'lab',
        priority: 'high',
        actionLabel: 'View Report',
    });
};

/**
 * Create consultation completed message
 */
export const createConsultationCompletedMessage = async (appointment) => {
    return saveUserMessage({
        type: MESSAGE_TYPES.CONSULTATION_COMPLETED,
        title: 'Consultation Completed',
        message: `Your consultation with ${appointment.doctor?.name || 'Doctor'} has been completed. Check your prescription if available.`,
        orderId: appointment.orderId,
        appointmentId: appointment.id,
        orderType: 'consultation',
        priority: 'normal',
    });
};

export default {
    MESSAGE_TYPES,
    MESSAGE_CATEGORIES,
    saveUserMessage,
    getUserMessages,
    getOrderMessages,
    getUnreadCount,
    getMessagesByCategory,
    markMessageAsRead,
    markAllAsRead,
    deleteMessage,
    togglePinMessage,
    subscribeToMessages,
    subscribeToUnreadCount,
    createBookingConfirmationMessage,
    createPaymentSuccessMessage,
    createPaymentFailureMessage,
    createAppointmentReminderMessage,
    createLabReportAvailableMessage,
    createConsultationCompletedMessage,
};
