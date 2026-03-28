/**
 * Unified Booking Flow Service
 * 
 * Provides a single, reusable flow for all booking types:
 * - Doctor consultations
 * - Lab tests
 * - Prescriptions
 * - Pharmacy orders
 * 
 * Ensures zero data mismatch between booking and order at any stage
 */

import {
    ORDER_TYPES,
    ORDER_STATUS,
    PAYMENT_STATUS,
    createUnifiedOrder,
    handlePaymentSuccess,
    handlePaymentFailure,
    findOrderById,
    cancelOrder,
    rescheduleOrder,
} from './unifiedOrderService';

import {
    saveUserMessage,
    MESSAGE_TYPES,
    createPaymentSuccessMessage,
    createPaymentFailureMessage,
} from './messageHistoryService';

import {
    scheduleAppointmentReminders,
    cancelAppointmentReminders,
    displayNotification,
} from './localNotifications';

import { getCurrentUser } from './firebaseAuth';

// =====================================================
// BOOKING FLOW STATES
// =====================================================

export const BOOKING_STATES = {
    INITIATED: 'initiated',
    DETAILS_ENTERED: 'details_entered',
    PAYMENT_PENDING: 'payment_pending',
    PAYMENT_PROCESSING: 'payment_processing',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};

// =====================================================
// UNIFIED BOOKING FLOW CLASS
// =====================================================

/**
 * UnifiedBookingFlow manages the complete lifecycle of a booking
 * from initiation to completion
 */
class UnifiedBookingFlow {
    constructor(orderType) {
        this.orderType = orderType;
        this.bookingData = {};
        this.order = null;
        this.state = BOOKING_STATES.INITIATED;
        this.listeners = [];
    }

    // State management
    setState(newState) {
        this.state = newState;
        this.notifyListeners({ state: newState, order: this.order });
    }

    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners(data) {
        this.listeners.forEach(callback => callback(data));
    }

    /**
     * Step 1: Set booking details
     * This captures the immutable booking data that will be used will be used for the order
     */
    setBookingDetails(details) {
        this.bookingData = {
            ...this.bookingData,
            ...details,
            updatedAt: new Date().toISOString(),
        };
        this.setState(BOOKING_STATES.DETAILS_ENTERED);
        return this;
    }

    /**
     * Step 2: Initiate payment
     * Creates a pending order before payment processing
     */
    async initiatePayment(paymentMethod) {
        try {
            this.setState(BOOKING_STATES.PAYMENT_PENDING);

            // Create order with pending payment status
            const result = await createUnifiedOrder(
                this.bookingData,
                this.orderType,
                {
                    method: paymentMethod,
                    status: PAYMENT_STATUS.PENDING,
                }
            );

            if (result.success) {
                this.order = result.order;
                this.setState(BOOKING_STATES.PAYMENT_PROCESSING);
                return { success: true, order: this.order };
            }

            return result;

        } catch (error) {
            console.error('[BookingFlow] Payment initiation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Step 3a: Handle successful payment
     */
    async completePayment(paymentDetails) {
        try {
            if (!this.order) {
                return { success: false, error: 'No order found' };
            }

            // Update order with payment success
            const result = await handlePaymentSuccess(this.order.orderId, paymentDetails);

            if (result.success) {
                this.order = {
                    ...this.order,
                    status: ORDER_STATUS.CONFIRMED,
                    paymentStatus: PAYMENT_STATUS.PAID,
                    ...paymentDetails,
                };

                this.setState(BOOKING_STATES.PAYMENT_SUCCESS);

                // Create payment success message
                await createPaymentSuccessMessage(this.order, paymentDetails);

                return { success: true, order: this.order };
            }

            return result;

        } catch (error) {
            console.error('[BookingFlow] Payment completion error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Step 3b: Handle failed payment
     */
    async handleFailedPayment(errorDetails) {
        try {
            if (!this.order) {
                return { success: false, error: 'No order found' };
            }

            await handlePaymentFailure(this.order.orderId, errorDetails);

            this.order = {
                ...this.order,
                status: ORDER_STATUS.PENDING,
                paymentStatus: PAYMENT_STATUS.FAILED,
            };

            this.setState(BOOKING_STATES.PAYMENT_FAILED);

            // Create payment failure message
            await createPaymentFailureMessage(
                this.order.orderId,
                errorDetails.message || 'Payment failed'
            );

            return { success: true, order: this.order };

        } catch (error) {
            console.error('[BookingFlow] Payment failure handling error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Confirm the booking (after successful payment)
     */
    async confirmBooking() {
        try {
            if (!this.order) {
                return { success: false, error: 'No order found' };
            }

            this.setState(BOOKING_STATES.CONFIRMED);

            return { success: true, order: this.order };

        } catch (error) {
            console.error('[BookingFlow] Booking confirmation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel the booking
     */
    async cancelBooking(reason = '') {
        try {
            if (!this.order) {
                return { success: false, error: 'No order to cancel' };
            }

            const result = await cancelOrder(this.order.orderId, reason);

            if (result.success) {
                this.order = {
                    ...this.order,
                    status: ORDER_STATUS.CANCELLED,
                };
                this.setState(BOOKING_STATES.CANCELLED);

                // Cancel any scheduled reminders
                if (this.orderType === ORDER_TYPES.CONSULTATION) {
                    await cancelAppointmentReminders(this.order.orderId);
                }
            }

            return result;

        } catch (error) {
            console.error('[BookingFlow] Cancellation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reschedule the booking
     */
    async rescheduleBooking(newSchedule) {
        try {
            if (!this.order) {
                return { success: false, error: 'No order to reschedule' };
            }

            const result = await rescheduleOrder(this.order.orderId, newSchedule);

            if (result.success) {
                // Update local order reference
                const updatedOrder = await findOrderById(this.order.orderId);
                if (updatedOrder.success) {
                    this.order = updatedOrder.data;
                }
            }

            return result;

        } catch (error) {
            console.error('[BookingFlow] Reschedule error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current order/booking data
     */
    getOrder() {
        return this.order;
    }

    /**
     * Get navigation params for post-booking screen
     */
    getNavigationParams() {
        return {
            order: this.order,
            orderId: this.order?.orderId,
            bookingId: this.order?.bookingId,
            orderType: this.orderType,
            status: this.state,
        };
    }
}

// =====================================================
// FACTORY FUNCTIONS
// =====================================================

/**
 * Create a consultation booking flow
 */
export const createConsultationBooking = () => {
    return new UnifiedBookingFlow(ORDER_TYPES.CONSULTATION);
};

/**
 * Create a lab test booking flow
 */
export const createLabTestBooking = () => {
    return new UnifiedBookingFlow(ORDER_TYPES.LAB_TEST);
};

/**
 * Create a prescription order flow
 */
export const createPrescriptionOrder = () => {
    return new UnifiedBookingFlow(ORDER_TYPES.PRESCRIPTION);
};

/**
 * Create a pharmacy order flow
 */
export const createPharmacyOrder = () => {
    return new UnifiedBookingFlow(ORDER_TYPES.PHARMACY);
};

// =====================================================
// QUICK BOOKING FUNCTIONS (For Legacy Integration)
// =====================================================

/**
 * Quick consultation booking (all-in-one)
 * @param {object} bookingData - Complete booking data
 * @param {object} paymentInfo - Payment details
 * @returns {Promise<{success: boolean, order?: object, error?: string}>}
 */
export const quickBookConsultation = async (bookingData, paymentInfo) => {
    const flow = createConsultationBooking();
    flow.setBookingDetails(bookingData);

    const initResult = await flow.initiatePayment(paymentInfo.method);
    if (!initResult.success) return initResult;

    const paymentResult = await flow.completePayment(paymentInfo);
    if (!paymentResult.success) return paymentResult;

    return flow.confirmBooking();
};

/**
 * Quick lab test booking (all-in-one)
 */
export const quickBookLabTest = async (bookingData, paymentInfo) => {
    const flow = createLabTestBooking();
    flow.setBookingDetails(bookingData);

    const initResult = await flow.initiatePayment(paymentInfo.method);
    if (!initResult.success) return initResult;

    const paymentResult = await flow.completePayment(paymentInfo);
    if (!paymentResult.success) return paymentResult;

    return flow.confirmBooking();
};

/**
 * Quick pharmacy order (all-in-one)
 */
export const quickPharmacyOrder = async (bookingData, paymentInfo) => {
    const flow = createPharmacyOrder();
    flow.setBookingDetails(bookingData);

    const initResult = await flow.initiatePayment(paymentInfo.method);
    if (!initResult.success) return initResult;

    const paymentResult = await flow.completePayment(paymentInfo);
    if (!paymentResult.success) return paymentResult;

    return flow.confirmBooking();
};

// =====================================================
// NAVIGATION HELPERS
// =====================================================

/**
 * Get the appropriate screen to navigate after booking completion
 * @param {string} orderType - Type of order
 * @param {string} action - 'view_order' | 'view_bill' | 'track'
 * @returns {object} Navigation config { screen, params }
 */
export const getPostBookingNavigation = (order, action = 'view_order') => {
    const orderType = order.orderType;

    const navigationMap = {
        [ORDER_TYPES.CONSULTATION]: {
            view_order: { screen: 'AppointmentDetailsScreen', params: { appointment: order } },
            view_bill: { screen: 'ConsultationBillScreen', params: { appointmentId: order.orderId, appointment: order } },
            track: { screen: 'AppointmentDetailsScreen', params: { appointment: order } },
        },
        [ORDER_TYPES.LAB_TEST]: {
            view_order: { screen: 'LabTestDetailsScreen', params: { order } },
            view_bill: { screen: 'LabBillScreen', params: { order } },
            track: { screen: 'LabTestDetailsScreen', params: { order } },
        },
        [ORDER_TYPES.PRESCRIPTION]: {
            view_order: { screen: 'OrderDetailScreen', params: { order } },
            view_bill: { screen: 'OrderDetailScreen', params: { order } },
            track: { screen: 'OrderDetailScreen', params: { order } },
        },
        [ORDER_TYPES.PHARMACY]: {
            view_order: { screen: 'OrderDetailScreen', params: { order } },
            view_bill: { screen: 'OrderDetailScreen', params: { order } },
            track: { screen: 'OrderDetailScreen', params: { order } },
        },
    };

    return navigationMap[orderType]?.[action] || { screen: 'OrdersScreen', params: {} };
};

/**
 * Navigate to order details screen
 * @param {object} navigation - React Navigation object
 * @param {object} order - Order object
 * @param {string} action - Navigation action
 */
export const navigateToOrder = (navigation, order, action = 'view_order') => {
    const { screen, params } = getPostBookingNavigation(order, action);
    navigation.navigate(screen, params);
};

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate booking data for completeness
 * @param {object} bookingData - Booking data to validate
 * @param {string} orderType - Type of order
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateBookingData = (bookingData, orderType) => {
    const errors = [];

    // Common validations
    if (!getCurrentUser()) {
        errors.push('User must be logged in');
    }

    switch (orderType) {
        case ORDER_TYPES.CONSULTATION:
            if (!bookingData.doctor) errors.push('Doctor selection is required');
            if (!bookingData.date) errors.push('Appointment date is required');
            if (!bookingData.time) errors.push('Appointment time is required');
            if (!bookingData.patientName) errors.push('Patient name is required');
            break;

        case ORDER_TYPES.LAB_TEST:
            if (!bookingData.items || bookingData.items.length === 0) {
                errors.push('At least one test must be selected');
            }
            if (!bookingData.schedule?.date) errors.push('Collection date is required');
            if (!bookingData.schedule?.timeSlot) errors.push('Time slot is required');
            break;

        case ORDER_TYPES.PRESCRIPTION:
            if (!bookingData.prescriptionImage && (!bookingData.items || bookingData.items.length === 0)) {
                errors.push('Prescription image or medicine list is required');
            }
            break;

        case ORDER_TYPES.PHARMACY:
            if (!bookingData.items || bookingData.items.length === 0) {
                errors.push('Cart cannot be empty');
            }
            break;
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export default {
    BOOKING_STATES,
    UnifiedBookingFlow,
    createConsultationBooking,
    createLabTestBooking,
    createPrescriptionOrder,
    createPharmacyOrder,
    quickBookConsultation,
    quickBookLabTest,
    quickPharmacyOrder,
    getPostBookingNavigation,
    navigateToOrder,
    validateBookingData,
};
