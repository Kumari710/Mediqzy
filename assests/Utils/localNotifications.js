/**
 * Local Notifications Service
 * 
 * Handles local notifications, scheduled notifications,
 * badge counts, and sound/vibration settings using Notifee
 */

import notifee, {
    AndroidImportance,
    TriggerType,
    RepeatFrequency,
    AndroidStyle,
    EventType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as navigationService from './navigationService';

const STORAGE_KEYS = {
    NOTIFICATION_SOUND: '@settings_notification_sound',
    NOTIFICATION_VIBRATION: '@settings_notification_vibration',
    MEDICINE_REMINDERS: '@medicine_reminders',
};

const CHANNEL_IDS = {
    DEFAULT: 'mediqzy_default',
    ORDERS: 'mediqzy_orders',
    REMINDERS: 'mediqzy_reminders',
    PROMOTIONS: 'mediqzy_promotions',
};

// =====================================================
// CHANNEL SETUP
// =====================================================

/**
 * Handle notification navigation based on type
 * @param {object} notification 
 */
export const handleNotificationNavigation = (notification) => {
    const data = notification?.data;
    if (!data) return;

    if (data.type === 'cart_add') {
        navigationService.navigate(data.cartType === 'lab' ? 'LabCartScreen' : 'PharmacyCartScreen');
    } else if (data.type === 'medicine_reminder') {
        navigationService.navigate('MedicineReminderScreen');
    } else if (data.type === 'appointment_reminder') {
        navigationService.navigate('AppointmentDetailsScreen', { appointmentId: data.appointmentId });
    }
};

/**
 * Create notification channels (required for Android)
 */
export const createNotificationChannels = async () => {
    if (Platform.OS !== 'android') return;

    try {
        // Default channel
        await notifee.createChannel({
            id: CHANNEL_IDS.DEFAULT,
            name: 'General Notifications',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        // Orders channel
        await notifee.createChannel({
            id: CHANNEL_IDS.ORDERS,
            name: 'Order Updates',
            description: 'Notifications about your pharmacy orders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        // Reminders channel
        await notifee.createChannel({
            id: CHANNEL_IDS.REMINDERS,
            name: 'Medicine Reminders',
            description: 'Reminders to take your medicines',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        // Promotions channel
        await notifee.createChannel({
            id: CHANNEL_IDS.PROMOTIONS,
            name: 'Promotions & Offers',
            description: 'Special deals and discounts',
            importance: AndroidImportance.DEFAULT,
            sound: 'default',
            vibration: false,
        });

        console.log('Notification channels created');
    } catch (error) {
        console.error('Error creating notification channels:', error);
    }
};

// =====================================================
// BADGE COUNT
// =====================================================

/**
 * Set badge count on app icon
 * @param {number} count - Badge count (0 to clear)
 */
export const setBadgeCount = async (count) => {
    try {
        await notifee.setBadgeCount(count);
    } catch (error) {
        console.error('Error setting badge count:', error);
    }
};

/**
 * Get current badge count
 * @returns {Promise<number>}
 */
export const getBadgeCount = async () => {
    try {
        return await notifee.getBadgeCount();
    } catch (error) {
        console.error('Error getting badge count:', error);
        return 0;
    }
};

/**
 * Increment badge count
 */
export const incrementBadgeCount = async () => {
    try {
        const current = await getBadgeCount();
        await setBadgeCount(current + 1);
    } catch (error) {
        console.error('Error incrementing badge count:', error);
    }
};

/**
 * Decrement badge count
 */
export const decrementBadgeCount = async () => {
    try {
        const current = await getBadgeCount();
        await setBadgeCount(Math.max(0, current - 1));
    } catch (error) {
        console.error('Error decrementing badge count:', error);
    }
};

/**
 * Clear badge count
 */
export const clearBadgeCount = async () => {
    await setBadgeCount(0);
};

// =====================================================
// SOUND & VIBRATION SETTINGS
// =====================================================

/**
 * Get notification sound setting
 * @returns {Promise<boolean>}
 */
export const getSoundEnabled = async () => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SOUND);
        return value !== 'false';
    } catch (error) {
        return true;
    }
};

/**
 * Set notification sound setting
 * @param {boolean} enabled
 */
export const setSoundEnabled = async (enabled) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SOUND, enabled.toString());
    } catch (error) {
        console.error('Error saving sound setting:', error);
    }
};

/**
 * Get notification vibration setting
 * @returns {Promise<boolean>}
 */
export const getVibrationEnabled = async () => {
    try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_VIBRATION);
        return value !== 'false';
    } catch (error) {
        return true;
    }
};

/**
 * Set notification vibration setting
 * @param {boolean} enabled
 */
export const setVibrationEnabled = async (enabled) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_VIBRATION, enabled.toString());
    } catch (error) {
        console.error('Error saving vibration setting:', error);
    }
};

// =====================================================
// LOCAL NOTIFICATIONS
// =====================================================

/**
 * Display a local notification immediately
 * @param {object} notification - Notification options
 */
export const displayNotification = async (notification) => {
    try {
        const soundEnabled = await getSoundEnabled();
        const vibrationEnabled = await getVibrationEnabled();

        await notifee.displayNotification({
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            android: {
                channelId: notification.channelId || CHANNEL_IDS.DEFAULT,
                smallIcon: 'ic_launcher',
                color: '#23238E',
                importance: AndroidImportance.HIGH,
                sound: soundEnabled ? 'default' : undefined,
                vibrationPattern: vibrationEnabled ? [300, 500] : undefined,
                pressAction: {
                    id: 'default',
                },
                style: notification.bigText ? {
                    type: AndroidStyle.BIGTEXT,
                    text: notification.bigText,
                } : undefined,
            },
            ios: {
                sound: soundEnabled ? 'default' : undefined,
            },
        });

        // Increment badge count
        await incrementBadgeCount();
    } catch (error) {
        console.error('Error displaying notification:', error);
    }
};

// =====================================================
// SCHEDULED NOTIFICATIONS (MEDICINE REMINDERS)
// =====================================================

/**
 * Schedule a medicine reminder
 * @param {object} reminder - Reminder details
 * @param {string} reminder.id - Unique reminder ID
 * @param {string} reminder.medicineName - Name of the medicine
 * @param {string} reminder.dosage - Dosage amount
 * @param {number} reminder.hour - Hour (0-23)
 * @param {number} reminder.minute - Minute (0-59)
 * @param {boolean} reminder.daily - If true, repeats daily
 */
export const scheduleMedicineReminder = async (reminder) => {
    try {
        const { id, medicineName, dosage, hour, minute, daily = true } = reminder;

        // Calculate next trigger time
        const now = new Date();
        const triggerDate = new Date();
        triggerDate.setHours(hour, minute, 0, 0);

        // If the time is in the past, schedule for tomorrow
        if (triggerDate <= now) {
            triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: triggerDate.getTime(),
            ...(daily && { repeatFrequency: RepeatFrequency.DAILY }),
        };

        await notifee.createTriggerNotification(
            {
                id: `reminder_${id}`,
                title: '💊 Medicine Reminder',
                body: `Time to take ${medicineName}${dosage ? ` - ${dosage}` : ''}`,
                data: { type: 'medicine_reminder', reminderId: id },
                android: {
                    channelId: CHANNEL_IDS.REMINDERS,
                    smallIcon: 'ic_launcher',
                    color: '#23238E',
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: 'default' },
                },
            },
            trigger
        );

        // Save reminder to storage
        await saveMedicineReminder(reminder);

        console.log(`Medicine reminder scheduled for ${hour}:${minute}`);
        return { success: true };
    } catch (error) {
        console.error('Error scheduling medicine reminder:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel a medicine reminder
 * @param {string} id - Reminder ID
 */
export const cancelMedicineReminder = async (id) => {
    try {
        await notifee.cancelNotification(`reminder_${id}`);
        await removeMedicineReminder(id);
        return { success: true };
    } catch (error) {
        console.error('Error cancelling medicine reminder:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all scheduled medicine reminders
 * @returns {Promise<array>}
 */
export const getMedicineReminders = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICINE_REMINDERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting medicine reminders:', error);
        return [];
    }
};

/**
 * Save a medicine reminder to storage
 */
const saveMedicineReminder = async (reminder) => {
    try {
        const reminders = await getMedicineReminders();
        const existingIndex = reminders.findIndex(r => r.id === reminder.id);

        if (existingIndex >= 0) {
            reminders[existingIndex] = reminder;
        } else {
            reminders.push(reminder);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.MEDICINE_REMINDERS, JSON.stringify(reminders));
    } catch (error) {
        console.error('Error saving medicine reminder:', error);
    }
};

/**
 * Remove a medicine reminder from storage
 */
const removeMedicineReminder = async (id) => {
    try {
        const reminders = await getMedicineReminders();
        const filtered = reminders.filter(r => r.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.MEDICINE_REMINDERS, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing medicine reminder:', error);
    }
};

// =====================================================
// APPOINTMENT REMINDERS
// =====================================================

/**
 * Parse appointment date and time to a Date object
 * @param {string} dateStr - Date string (e.g., "21.05.25" or "21/05/25")
 * @param {string} timeStr - Time string (e.g., "11:00 AM")
 * @returns {Date}
 */
const parseAppointmentDateTime = (dateStr, timeStr) => {
    // Parse date (DD.MM.YY or DD/MM/YY format)
    const dateParts = dateStr.replace(/\//g, '.').split('.');
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    let year = parseInt(dateParts[2]);
    if (year < 100) year += 2000; // Convert YY to YYYY

    // Parse time (HH:MM AM/PM format)
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const period = timeParts[3];

    if (period) {
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    return new Date(year, month, day, hours, minutes, 0, 0);
};

/**
 * Schedule appointment reminders (1 hour before and 1 day before)
 * @param {object} appointment - Appointment details
 * @param {string} appointment.id - Appointment ID
 * @param {string} appointment.date - Appointment date
 * @param {string} appointment.time - Appointment time
 * @param {object} appointment.doctor - Doctor info
 */
export const scheduleAppointmentReminders = async (appointment) => {
    try {
        const { id, date, time, doctor } = appointment;
        const appointmentDate = parseAppointmentDateTime(date, time);
        const now = new Date();

        // Calculate reminder times
        const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
        const oneDayBefore = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);

        const doctorName = doctor?.name || 'Doctor';

        // Schedule 1 hour before reminder
        if (oneHourBefore > now) {
            await notifee.createTriggerNotification(
                {
                    id: `appt_1h_${id}`,
                    title: '⏰ Appointment in 1 Hour',
                    body: `Your appointment with ${doctorName} starts in 1 hour at ${time}`,
                    data: { type: 'appointment_reminder', appointmentId: id },
                    android: {
                        channelId: CHANNEL_IDS.REMINDERS,
                        smallIcon: 'ic_launcher',
                        color: '#23238E',
                        importance: AndroidImportance.HIGH,
                        pressAction: { id: 'default' },
                    },
                },
                {
                    type: TriggerType.TIMESTAMP,
                    timestamp: oneHourBefore.getTime(),
                }
            );
            console.log('Scheduled 1-hour reminder for:', oneHourBefore);
        }

        // Schedule 1 day before reminder
        if (oneDayBefore > now) {
            await notifee.createTriggerNotification(
                {
                    id: `appt_1d_${id}`,
                    title: '📅 Appointment Tomorrow',
                    body: `Reminder: You have an appointment with ${doctorName} tomorrow at ${time}`,
                    data: { type: 'appointment_reminder', appointmentId: id },
                    android: {
                        channelId: CHANNEL_IDS.REMINDERS,
                        smallIcon: 'ic_launcher',
                        color: '#23238E',
                        importance: AndroidImportance.DEFAULT,
                        pressAction: { id: 'default' },
                    },
                },
                {
                    type: TriggerType.TIMESTAMP,
                    timestamp: oneDayBefore.getTime(),
                }
            );
            console.log('Scheduled 1-day reminder for:', oneDayBefore);
        }

        return { success: true };
    } catch (error) {
        console.error('Error scheduling appointment reminders:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel appointment reminders
 * @param {string} appointmentId - Appointment ID
 */
export const cancelAppointmentReminders = async (appointmentId) => {
    try {
        await notifee.cancelNotification(`appt_1h_${appointmentId}`);
        await notifee.cancelNotification(`appt_1d_${appointmentId}`);
        return { success: true };
    } catch (error) {
        console.error('Error cancelling appointment reminders:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update appointment reminders (cancel old and schedule new)
 * @param {object} appointment - Updated appointment details
 */
export const updateAppointmentReminders = async (appointment) => {
    await cancelAppointmentReminders(appointment.id);
    if (appointment.status === 'upcoming') {
        return await scheduleAppointmentReminders(appointment);
    }
    return { success: true };
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
    try {
        await notifee.cancelAllNotifications();
        await clearBadgeCount();
    } catch (error) {
        console.error('Error cancelling all notifications:', error);
    }
};

/**
 * Get all pending notifications
 * @returns {Promise<array>}
 */
export const getPendingNotifications = async () => {
    try {
        return await notifee.getTriggerNotifications();
    } catch (error) {
        console.error('Error getting pending notifications:', error);
        return [];
    }
};

// =====================================================
// CART NOTIFICATIONS
// =====================================================

/**
 * Show "Added to Cart" notification
 * @param {object} options - Notification options
 * @param {string} options.productName - Name of the product added
 * @param {string} options.cartType - Type of cart ('pharmacy' | 'lab')
 * @param {number} options.quantity - Quantity added (optional)
 */
export const showAddToCartNotification = async (options) => {
    try {
        const { productName, cartType = 'pharmacy', quantity = 1 } = options;

        const icon = cartType === 'lab' ? '🧪' : '🛒';
        const cartLabel = cartType === 'lab' ? 'Lab Test Cart' : 'Cart';

        await displayNotification({
            title: `${icon} Added to ${cartLabel}!`,
            body: quantity > 1
                ? `${productName} (x${quantity}) has been added to your cart.`
                : `${productName} has been added to your cart.`,
            channelId: CHANNEL_IDS.ORDERS,
            data: { type: 'cart_add', productName, cartType },
        });

        console.log(`Cart notification shown for: ${productName}`);
        return { success: true };
    } catch (error) {
        console.error('Error showing cart notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Show "Quantity Updated" notification
 * @param {object} options - Notification options
 * @param {string} options.productName - Name of the product
 * @param {number} options.newQuantity - New quantity in cart
 */
export const showQuantityUpdatedNotification = async (options) => {
    try {
        const { productName, newQuantity } = options;

        await displayNotification({
            title: '🛒 Cart Updated!',
            body: `${productName} quantity updated to ${newQuantity}.`,
            channelId: CHANNEL_IDS.ORDERS,
            data: { type: 'cart_update', productName },
        });

        return { success: true };
    } catch (error) {
        console.error('Error showing quantity notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Show "Order Placed" notification
 * @param {object} options - Notification options
 * @param {string} options.orderId - Order ID
 * @param {string} options.orderType - Type of order ('pharmacy' | 'lab')
 * @param {number} options.total - Order total amount
 * @param {number} options.itemCount - Number of items in order
 */
export const showOrderPlacedNotification = async (options) => {
    try {
        const { orderId, orderType = 'pharmacy', total, itemCount = 1 } = options;

        const icon = orderType === 'lab' ? '🧪' : '🎉';
        const orderLabel = orderType === 'lab' ? 'Lab Test Booking' : 'Order';
        const shortId = orderId ? orderId.slice(-6).toUpperCase() : '';

        await displayNotification({
            title: `${icon} ${orderLabel} Placed Successfully!`,
            body: `Your ${orderLabel.toLowerCase()} #${shortId} with ${itemCount} item${itemCount > 1 ? 's' : ''} (₹${total}) has been placed. Track your order for updates.`,
            bigText: `Your ${orderLabel.toLowerCase()} #${shortId} has been placed successfully!\n\nTotal Amount: ₹${total}\nItems: ${itemCount}\n\nYou can track your order status anytime from the Orders section.`,
            channelId: CHANNEL_IDS.ORDERS,
            data: { type: 'order_placed', orderId, orderType },
        });

        console.log(`Order placed notification shown for: ${orderId}`);
        return { success: true };
    } catch (error) {
        console.error('Error showing order placed notification:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// LAB TEST REMINDERS
// =====================================================

/**
 * Schedule lab test collection reminders
 * @param {object} order - Lab order details
 * @param {string} order.orderId - Order ID
 * @param {object} order.schedule - Schedule info with date and timeSlot
 */
export const scheduleLabReminders = async (order) => {
    try {
        if (!order.schedule?.date || !order.schedule?.timeSlot) {
            console.log('[LabReminder] Missing schedule info, skipping reminders');
            return;
        }

        const { date, timeSlot } = order.schedule;
        const orderId = order.orderId;

        // Parse the date (format: "21 Jan 2026")
        const dateParts = date.match(/(\d+)\s+(\w+)\s+(\d+)/);
        if (!dateParts) {
            console.log('[LabReminder] Could not parse date:', date);
            return;
        }

        const months = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        const day = parseInt(dateParts[1]);
        const month = months[dateParts[2].toLowerCase().substring(0, 3)];
        const year = parseInt(dateParts[3]);

        // Parse time slot to get start hour (e.g., "08:00 AM - 10:00 AM")
        const timeMatch = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        let hour = 0;
        if (timeMatch) {
            hour = parseInt(timeMatch[1]);
            if (timeMatch[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
            if (timeMatch[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
        }

        const collectionDate = new Date(year, month, day, hour, 0);
        const now = new Date();

        // Schedule reminder 1 day before
        const oneDayBefore = new Date(collectionDate.getTime() - 24 * 60 * 60 * 1000);
        if (oneDayBefore > now) {
            await notifee.createTriggerNotification(
                {
                    id: `lab_reminder_1d_${orderId}`,
                    title: '🧪 Lab Test Tomorrow',
                    body: `Your lab test collection is scheduled for tomorrow at ${timeSlot}. Please prepare as instructed.`,
                    android: {
                        channelId: CHANNEL_IDS.REMINDERS,
                        smallIcon: 'ic_launcher',
                        pressAction: { id: 'default' },
                    },
                    data: { type: 'lab_reminder', orderId },
                },
                {
                    type: TriggerType.TIMESTAMP,
                    timestamp: oneDayBefore.getTime(),
                }
            );
            console.log(`[LabReminder] Scheduled 1-day reminder for ${orderId} at ${oneDayBefore}`);
        }

        // Schedule reminder 2 hours before
        const twoHoursBefore = new Date(collectionDate.getTime() - 2 * 60 * 60 * 1000);
        if (twoHoursBefore > now) {
            await notifee.createTriggerNotification(
                {
                    id: `lab_reminder_2h_${orderId}`,
                    title: '🧪 Sample Collection in 2 Hours',
                    body: `The technician will arrive in approximately 2 hours for sample collection. Please be ready.`,
                    android: {
                        channelId: CHANNEL_IDS.REMINDERS,
                        smallIcon: 'ic_launcher',
                        pressAction: { id: 'default' },
                    },
                    data: { type: 'lab_reminder', orderId },
                },
                {
                    type: TriggerType.TIMESTAMP,
                    timestamp: twoHoursBefore.getTime(),
                }
            );
            console.log(`[LabReminder] Scheduled 2-hour reminder for ${orderId} at ${twoHoursBefore}`);
        }

        return { success: true };
    } catch (error) {
        console.error('[LabReminder] Error scheduling reminders:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel lab test reminders for an order
 * @param {string} orderId - Order ID
 */
export const cancelLabReminders = async (orderId) => {
    try {
        await notifee.cancelNotification(`lab_reminder_1d_${orderId}`);
        await notifee.cancelNotification(`lab_reminder_2h_${orderId}`);
        console.log(`[LabReminder] Cancelled reminders for ${orderId}`);
        return { success: true };
    } catch (error) {
        console.error('[LabReminder] Error cancelling reminders:', error);
        return { success: false, error: error.message };
    }
};

// =====================================================
// INITIALIZATION
// =====================================================

/**
 * Initialize local notifications
 */
export const initializeLocalNotifications = async () => {
    try {
        // Create channels
        await createNotificationChannels();

        // Foreground event handler
        notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                handleNotificationNavigation(detail.notification);
            }
        });

        // Request permissions
        const settings = await notifee.requestPermission();
        console.log('Notification permission:', settings);

        return { success: true };
    } catch (error) {
        console.error('Error initializing local notifications:', error);
        return { success: false, error: error.message };
    }
};

export default {
    createNotificationChannels,
    setBadgeCount,
    getBadgeCount,
    incrementBadgeCount,
    decrementBadgeCount,
    clearBadgeCount,
    getSoundEnabled,
    setSoundEnabled,
    getVibrationEnabled,
    setVibrationEnabled,
    displayNotification,
    scheduleMedicineReminder,
    cancelMedicineReminder,
    getMedicineReminders,
    scheduleAppointmentReminders,
    cancelAppointmentReminders,
    updateAppointmentReminders,
    scheduleLabReminders,
    cancelLabReminders,
    cancelAllNotifications,
    getPendingNotifications,
    initializeLocalNotifications,
    showAddToCartNotification,
    showQuantityUpdatedNotification,
    showOrderPlacedNotification,
    handleNotificationNavigation,
    CHANNEL_IDS,
};

