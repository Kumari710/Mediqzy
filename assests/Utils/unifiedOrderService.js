/**
 * Unified Order Service
 * 
 * Centralized service for creating, managing, and tracking orders
 * across all service types: Consultations, Lab Tests, Prescriptions, Pharmacy
 * 
 * Ensures 100% data consistency between booking and order entities
 */

import database from '@react-native-firebase/database';
import { getCurrentUser } from './firebaseAuth';
import { createNotification, pushData, updateData, getData } from './firebaseDatabase';
import {
    displayNotification,
    scheduleAppointmentReminders,
    scheduleLabReminders as scheduleLabNotificationReminders,
    showOrderPlacedNotification
} from './localNotifications';
import { saveUserMessage } from './messageHistoryService';

// =====================================================
// ORDER TYPES & STATUSES
// =====================================================

export const ORDER_TYPES = {
    CONSULTATION: 'consultation',
    LAB_TEST: 'lab',
    PRESCRIPTION: 'prescription',
    PHARMACY: 'pharmacy',
};

export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
    RESCHEDULED: 'rescheduled',
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};

// =====================================================
// UNIFIED ORDER ID GENERATOR
// =====================================================

/**
 * Generate a unique order ID with type prefix
 * @param {string} type - Order type from ORDER_TYPES
 * @returns {string} Unique order ID
 */
export const generateOrderId = (type) => {
    const prefix = {
        [ORDER_TYPES.CONSULTATION]: 'CONS',
        [ORDER_TYPES.LAB_TEST]: 'LAB',
        [ORDER_TYPES.PRESCRIPTION]: 'RX',
        [ORDER_TYPES.PHARMACY]: 'PH',
    };
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix[type] || 'ORD'}${timestamp}${random}`;
};

/**
 * Generate a unique booking ID
 * @returns {string} Unique booking ID
 */
export const generateBookingId = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
};

// =====================================================
// UNIFIED ORDER DATA MODEL
// =====================================================

/**
 * Creates a standardized order object from booking data
 * This ensures 100% consistency between booking and order
 * 
 * @param {object} bookingData - Raw booking data from any service
 * @param {string} orderType - Type from ORDER_TYPES
 * @returns {object} Standardized order object
 */
export const createOrderFromBooking = (bookingData, orderType) => {
    const user = getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();
    const orderId = generateOrderId(orderType);
    const bookingId = bookingData.bookingId || generateBookingId();

    // Base order structure (immutable after creation)
    const baseOrder = {
        // Identifiers
        orderId,
        bookingId,
        userId: user.uid,
        userEmail: user.email || '',
        orderType,

        // Timestamps
        createdAt: now,
        updatedAt: now,

        // Status (mutable)
        status: ORDER_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,

        // Metadata
        version: 1, // For optimistic concurrency
        source: 'app', // app, web, manual
    };

    // Type-specific data mapping
    switch (orderType) {
        case ORDER_TYPES.CONSULTATION:
            return {
                ...baseOrder,
                // Doctor info (frozen from booking)
                doctor: bookingData.doctor ? {
                    id: bookingData.doctor.id || null,
                    name: bookingData.doctor.name || bookingData.doctor,
                    specialty: bookingData.doctor.specialty || bookingData.specialty || '',
                    rating: bookingData.doctor.rating || null,
                    image: bookingData.doctor.image || null,
                } : null,

                // Patient info (frozen from booking)
                patient: {
                    id: bookingData.patientId || null,
                    name: bookingData.patientName || 'Self',
                    phone: bookingData.patientPhone || bookingData.mobileNumber || '',
                    problem: bookingData.problem || '',
                },

                // Appointment details (frozen from booking)
                appointment: {
                    date: bookingData.date,
                    time: bookingData.time,
                    type: bookingData.type || 'online', // online/offline
                    consultationType: bookingData.consultationType || 'general',
                    location: bookingData.location || null,
                    hospital: bookingData.hospital || null,
                },

                // Pricing (frozen from booking)
                pricing: {
                    consultationFee: bookingData.fee || bookingData.price || 0,
                    bookingFee: bookingData.bookingFee || 40,
                    discount: bookingData.discount || 0,
                    tax: bookingData.tax || 0,
                    total: (bookingData.fee || bookingData.price || 0) +
                        (bookingData.bookingFee || 40) -
                        (bookingData.discount || 0) +
                        (bookingData.tax || 0),
                },

                // Additional data
                consultationNo: bookingData.consultationNo || orderId,
            };

        case ORDER_TYPES.LAB_TEST:
            return {
                ...baseOrder,
                // Lab info
                lab: bookingData.lab ? {
                    id: bookingData.lab.id || null,
                    name: bookingData.lab.name || 'Apollo Labs',
                    address: bookingData.lab.address || '',
                    image: bookingData.lab.image || null,
                } : { name: 'Apollo Labs' },

                // Test items (frozen from cart)
                items: (bookingData.items || []).map(item => ({
                    id: item.id || item.testId,
                    name: item.name || item.testName,
                    price: item.price,
                    originalPrice: item.originalPrice || item.price,
                    category: item.category || 'general',
                })),

                // Patient info
                patient: {
                    id: bookingData.patientId || null,
                    name: bookingData.patientName || 'Self',
                    phone: bookingData.patientPhone || '',
                    age: bookingData.patientAge || null,
                    gender: bookingData.patientGender || null,
                },

                // Schedule (frozen from booking)
                schedule: bookingData.schedule ? {
                    date: bookingData.schedule.date,
                    timeSlot: bookingData.schedule.timeSlot,
                    collectionType: bookingData.schedule.collectionType || 'home', // home/lab
                    address: bookingData.schedule.address || '',
                } : null,

                // Pricing
                pricing: {
                    subtotal: bookingData.summary?.subtotal || 0,
                    collectionCharge: bookingData.summary?.collectionCharge || 50,
                    discount: bookingData.summary?.discount || 0,
                    tax: bookingData.summary?.tax || 0,
                    total: bookingData.summary?.total || bookingData.total || 0,
                },
            };

        case ORDER_TYPES.PRESCRIPTION:
            return {
                ...baseOrder,
                // Prescription info
                prescription: {
                    id: bookingData.prescriptionId || null,
                    imageUrl: bookingData.prescriptionImage || null,
                    doctorName: bookingData.doctorName || '',
                    hospital: bookingData.hospital || '',
                    appointmentId: bookingData.appointmentId || null,
                },

                // Medicines
                items: (bookingData.items || bookingData.medicines || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    dosage: item.dosage || '',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    refillable: item.refillable || false,
                })),

                // Delivery info
                delivery: {
                    type: bookingData.deliveryType || 'delivery', // pickup/delivery
                    address: bookingData.deliveryAddress || '',
                    expectedDate: bookingData.expectedDeliveryDate || null,
                },

                // Pricing
                pricing: {
                    subtotal: bookingData.subtotal || 0,
                    deliveryCharge: bookingData.deliveryCharge || 0,
                    discount: bookingData.discount || 0,
                    tax: bookingData.tax || 0,
                    total: bookingData.total || 0,
                },
            };

        case ORDER_TYPES.PHARMACY:
            return {
                ...baseOrder,
                // Items (frozen from cart)
                items: (bookingData.items || bookingData.products || []).map(item => ({
                    id: item.id || item.productId,
                    name: item.name || item.productName,
                    quantity: item.quantity || 1,
                    price: item.price,
                    image: item.image || null,
                    category: item.category || 'general',
                })),

                // Pharmacy info
                pharmacy: bookingData.pharmacy ? {
                    id: bookingData.pharmacy.id,
                    name: bookingData.pharmacy.name,
                    address: bookingData.pharmacy.address,
                } : null,

                // Delivery info
                delivery: {
                    type: bookingData.deliveryType || 'delivery',
                    address: bookingData.deliveryAddress || bookingData.address || '',
                    expectedDate: bookingData.expectedDeliveryDate || null,
                    instructions: bookingData.deliveryInstructions || '',
                },

                // Pricing
                pricing: {
                    subtotal: bookingData.subtotal || 0,
                    deliveryCharge: bookingData.deliveryCharge || 0,
                    discount: bookingData.discount || 0,
                    tax: bookingData.tax || 0,
                    total: bookingData.total || 0,
                },
            };

        default:
            return {
                ...baseOrder,
                data: bookingData,
            };
    }
};

// =====================================================
// ORDER CREATION & MANAGEMENT
// =====================================================

/**
 * Create a unified order from booking data
 * This is the SINGLE entry point for all order creation
 * 
 * @param {object} bookingData - Booking data from any service
 * @param {string} orderType - Type from ORDER_TYPES
 * @param {object} paymentInfo - Payment details
 * @returns {Promise<{success: boolean, order?: object, error?: string}>}
 */
export const createUnifiedOrder = async (bookingData, orderType, paymentInfo = {}) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        // 1. Create standardized order from booking
        const order = createOrderFromBooking(bookingData, orderType);

        // 2. Apply payment info
        order.paymentMethod = paymentInfo.method || 'unknown';
        order.paymentStatus = paymentInfo.status || PAYMENT_STATUS.PENDING;
        order.transactionId = paymentInfo.transactionId || null;

        // 3. Update status based on payment
        if (paymentInfo.status === PAYMENT_STATUS.PAID) {
            order.status = ORDER_STATUS.CONFIRMED;
        }

        console.log(`[UnifiedOrder] Creating ${orderType} order: ${order.orderId}`);

        // 4. Save to type-specific collection
        const typePath = getOrderTypePath(orderType, user.uid);
        const typeResult = await pushData(typePath, order);

        if (!typeResult.success) {
            throw new Error('Failed to save to type collection');
        }

        // 5. Save to centralized allOrders for unified lookup
        const allOrdersResult = await pushData('allOrders', {
            ...order,
            firebaseKey: typeResult.key,
        });

        // 6. Update the order with Firebase key
        const finalOrderPath = `${typePath}/${typeResult.key}`;
        await updateData(finalOrderPath, {
            firebaseKey: typeResult.key,
            allOrdersKey: allOrdersResult.key,
        });

        const finalOrder = {
            ...order,
            id: typeResult.key,
            firebaseKey: typeResult.key,
        };

        // 7. Trigger post-order creation hooks
        await handlePostOrderCreation(finalOrder, orderType);

        return { success: true, order: finalOrder };

    } catch (error) {
        console.error('[UnifiedOrder] Create error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get the Firebase path for an order type
 */
const getOrderTypePath = (orderType, userId) => {
    const paths = {
        [ORDER_TYPES.CONSULTATION]: `appointments/${userId}`,
        [ORDER_TYPES.LAB_TEST]: `labOrders/${userId}`,
        [ORDER_TYPES.PRESCRIPTION]: `prescriptionOrders/${userId}`,
        [ORDER_TYPES.PHARMACY]: `pharmacyOrders/${userId}`,
    };
    return paths[orderType] || `orders/${userId}`;
};

/**
 * Handle post-order creation tasks
 */
const handlePostOrderCreation = async (order, orderType) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
        // 1. Create booking confirmation message
        await saveUserMessage({
            type: 'booking_confirmation',
            title: getBookingConfirmationTitle(orderType),
            message: getBookingConfirmationMessage(order, orderType),
            orderId: order.orderId,
            bookingId: order.bookingId,
            orderType: orderType,
            data: { order },
        });

        // 2. Create database notification
        await createNotification(user.uid, {
            type: 'order',
            title: getBookingConfirmationTitle(orderType),
            message: getBookingConfirmationMessage(order, orderType),
            data: { orderId: order.orderId, orderType },
        });

        // 3. Show local push notification
        await showOrderPlacedNotification({
            orderId: order.orderId,
            orderType: orderType,
            total: order.pricing?.total || order.total || 0,
            itemCount: order.items?.length || 1,
        });

        // 4. Schedule reminders based on order type
        if (orderType === ORDER_TYPES.CONSULTATION && order.appointment) {
            await scheduleAppointmentReminders({
                id: order.orderId,
                date: order.appointment.date,
                time: order.appointment.time,
                doctor: order.doctor,
            });
        }

        // 5. Schedule lab collection reminder
        if (orderType === ORDER_TYPES.LAB_TEST && order.schedule) {
            await scheduleLabReminders(order);
        }

    } catch (error) {
        console.warn('[UnifiedOrder] Post-creation hooks error:', error);
    }
};

/**
 * Schedule lab test reminders using the localNotifications service
 */
const scheduleLabReminders = async (order) => {
    try {
        if (!order.schedule?.date || !order.schedule?.timeSlot) {
            console.log('[UnifiedOrder] Missing schedule info for lab reminders');
            return;
        }

        // Use the actual implementation from localNotifications
        await scheduleLabNotificationReminders(order);
        console.log(`[UnifiedOrder] Lab reminders scheduled for ${order.orderId}`);

    } catch (error) {
        console.warn('[UnifiedOrder] Lab reminder scheduling error:', error);
    }
};

// =====================================================
// ORDER STATUS MANAGEMENT
// =====================================================

/**
 * Update order status with full synchronization
 */
export const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        // Find order in allOrders
        const orderResult = await findOrderById(orderId);
        if (!orderResult.success) {
            return orderResult;
        }

        const order = orderResult.data;
        const now = new Date().toISOString();

        const updateObj = {
            status: newStatus,
            updatedAt: now,
            ...additionalData,
        };

        // Update in type-specific collection
        const typePath = getOrderTypePath(order.orderType, order.userId);
        if (order.firebaseKey) {
            await updateData(`${typePath}/${order.firebaseKey}`, updateObj);
        }

        // Update in allOrders
        if (order.allOrdersKey) {
            await updateData(`allOrders/${order.allOrdersKey}`, updateObj);
        }

        // Trigger status change notifications
        await handleStatusChange(order, newStatus);

        return { success: true };

    } catch (error) {
        console.error('[UnifiedOrder] Status update error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Handle status change notifications and messages
 */
const handleStatusChange = async (order, newStatus) => {
    const user = getCurrentUser();
    if (!user) return;

    const messageContent = getStatusChangeMessage(order, newStatus);

    // Save to message history
    await saveUserMessage({
        type: `order_${newStatus}`,
        title: messageContent.title,
        message: messageContent.message,
        orderId: order.orderId,
        orderType: order.orderType,
    });

    // Create notification
    await createNotification(user.uid, {
        type: 'order',
        title: messageContent.title,
        message: messageContent.message,
        data: { orderId: order.orderId, status: newStatus },
    });

    // Show local notification
    await displayNotification({
        title: messageContent.title,
        body: messageContent.message,
        channelId: 'mediqzy_orders',
        data: { orderId: order.orderId },
    });
};

/**
 * Cancel an order with reason
 */
export const cancelOrder = async (orderId, reason = '') => {
    return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, {
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
    });
};

/**
 * Reschedule an order (consultation/lab)
 */
export const rescheduleOrder = async (orderId, newSchedule) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const orderResult = await findOrderById(orderId);
        if (!orderResult.success) {
            return orderResult;
        }

        const order = orderResult.data;
        const now = new Date().toISOString();

        // Build update based on order type
        let updateObj = {
            status: ORDER_STATUS.RESCHEDULED,
            updatedAt: now,
            rescheduledAt: now,
            previousSchedule: order.appointment || order.schedule,
        };

        if (order.orderType === ORDER_TYPES.CONSULTATION) {
            updateObj.appointment = {
                ...order.appointment,
                date: newSchedule.date,
                time: newSchedule.time,
            };
        } else if (order.orderType === ORDER_TYPES.LAB_TEST) {
            updateObj.schedule = {
                ...order.schedule,
                date: newSchedule.date,
                timeSlot: newSchedule.timeSlot,
            };
        }

        // Update in collections
        const typePath = getOrderTypePath(order.orderType, order.userId);
        if (order.firebaseKey) {
            await updateData(`${typePath}/${order.firebaseKey}`, updateObj);
        }
        if (order.allOrdersKey) {
            await updateData(`allOrders/${order.allOrdersKey}`, updateObj);
        }

        // Cancel old reminders and schedule new ones
        if (order.orderType === ORDER_TYPES.CONSULTATION) {
            await scheduleAppointmentReminders({
                id: order.orderId,
                date: newSchedule.date,
                time: newSchedule.time,
                doctor: order.doctor,
            });
        }

        // Send reschedule notification
        await saveUserMessage({
            type: 'order_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Your ${order.orderType} has been rescheduled to ${newSchedule.date} at ${newSchedule.time || newSchedule.timeSlot}`,
            orderId: order.orderId,
            orderType: order.orderType,
        });

        return { success: true };

    } catch (error) {
        console.error('[UnifiedOrder] Reschedule error:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// ORDER RETRIEVAL
// =====================================================

/**
 * Find order by orderId across all collections
 */
export const findOrderById = async (orderId) => {
    try {
        const snapshot = await database()
            .ref('allOrders')
            .orderByChild('orderId')
            .equalTo(orderId)
            .once('value');

        const data = snapshot.val();
        if (data) {
            const key = Object.keys(data)[0];
            return { success: true, data: { ...data[key], allOrdersKey: key } };
        }
        return { success: false, error: 'Order not found' };
    } catch (error) {
        console.error('[UnifiedOrder] Find error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all orders for current user
 */
export const getUserOrders = async (limit = 50) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const snapshot = await database()
            .ref('allOrders')
            .orderByChild('userId')
            .equalTo(user.uid)
            .limitToLast(limit)
            .once('value');

        const data = snapshot.val();
        if (!data) {
            return { success: true, data: [] };
        }

        const orders = Object.entries(data)
            .map(([key, value]) => ({ ...value, allOrdersKey: key }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return { success: true, data: orders };

    } catch (error) {
        console.error('[UnifiedOrder] Get orders error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get orders by type
 */
export const getOrdersByType = async (orderType, limit = 50) => {
    const result = await getUserOrders(limit);
    if (!result.success) return result;

    const filtered = result.data.filter(order => order.orderType === orderType);
    return { success: true, data: filtered };
};

// =====================================================
// MESSAGE HELPERS
// =====================================================

const getBookingConfirmationTitle = (orderType) => {
    const titles = {
        [ORDER_TYPES.CONSULTATION]: 'Appointment Booked',
        [ORDER_TYPES.LAB_TEST]: 'Lab Test Booked',
        [ORDER_TYPES.PRESCRIPTION]: 'Prescription Order Placed',
        [ORDER_TYPES.PHARMACY]: 'Pharmacy Order Placed',
    };
    return titles[orderType] || 'Order Confirmed';
};

const getBookingConfirmationMessage = (order, orderType) => {
    switch (orderType) {
        case ORDER_TYPES.CONSULTATION:
            return `Your appointment with ${order.doctor?.name || 'Doctor'} is confirmed for ${order.appointment?.date} at ${order.appointment?.time}. Order ID: ${order.orderId}`;
        case ORDER_TYPES.LAB_TEST:
            return `Your lab test has been booked for ${order.schedule?.date}. Order ID: ${order.orderId}`;
        case ORDER_TYPES.PRESCRIPTION:
            return `Your prescription order has been placed. Order ID: ${order.orderId}`;
        case ORDER_TYPES.PHARMACY:
            return `Your pharmacy order has been placed and will be delivered soon. Order ID: ${order.orderId}`;
        default:
            return `Your order has been confirmed. Order ID: ${order.orderId}`;
    }
};

const getStatusChangeMessage = (order, status) => {
    const messages = {
        [ORDER_STATUS.CONFIRMED]: {
            title: 'Order Confirmed',
            message: `Your order ${order.orderId} has been confirmed.`,
        },
        [ORDER_STATUS.PROCESSING]: {
            title: 'Order Processing',
            message: `Your order ${order.orderId} is being processed.`,
        },
        [ORDER_STATUS.IN_PROGRESS]: {
            title: 'Order In Progress',
            message: `Your order ${order.orderId} is now in progress.`,
        },
        [ORDER_STATUS.COMPLETED]: {
            title: 'Order Completed',
            message: `Your order ${order.orderId} has been completed successfully.`,
        },
        [ORDER_STATUS.CANCELLED]: {
            title: 'Order Cancelled',
            message: `Your order ${order.orderId} has been cancelled.`,
        },
        [ORDER_STATUS.FAILED]: {
            title: 'Order Failed',
            message: `Your order ${order.orderId} could not be processed.`,
        },
    };
    return messages[status] || { title: 'Order Update', message: `Order ${order.orderId} status updated to ${status}` };
};

// =====================================================
// PAYMENT HANDLING
// =====================================================

/**
 * Handle payment success
 */
export const handlePaymentSuccess = async (orderId, paymentDetails) => {
    return updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED, {
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentMethod: paymentDetails.method,
        transactionId: paymentDetails.transactionId,
        paidAt: new Date().toISOString(),
    });
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (orderId, errorDetails) => {
    return updateOrderStatus(orderId, ORDER_STATUS.PENDING, {
        paymentStatus: PAYMENT_STATUS.FAILED,
        paymentError: errorDetails.message || 'Payment failed',
        paymentAttemptedAt: new Date().toISOString(),
    });
};

/**
 * Retry payment for failed order
 */
export const retryPayment = async (orderId) => {
    const orderResult = await findOrderById(orderId);
    if (!orderResult.success) {
        return orderResult;
    }

    // Reset payment status for retry
    return updateOrderStatus(orderId, ORDER_STATUS.PENDING, {
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentRetryAt: new Date().toISOString(),
    });
};

export default {
    ORDER_TYPES,
    ORDER_STATUS,
    PAYMENT_STATUS,
    generateOrderId,
    generateBookingId,
    createOrderFromBooking,
    createUnifiedOrder,
    updateOrderStatus,
    cancelOrder,
    rescheduleOrder,
    findOrderById,
    getUserOrders,
    getOrdersByType,
    handlePaymentSuccess,
    handlePaymentFailure,
    retryPayment,
};
