/**
 * Firebase Cloud Messaging (FCM) Service
 * 
 * Handles push notifications for the app including:
 * - Requesting permissions
 * - Getting/storing FCM tokens
 * - Handling foreground and background notifications
 */

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { updateData } from './firebaseDatabase';
import { getCurrentUser } from './firebaseAuth';

const STORAGE_KEYS = {
    FCM_TOKEN: '@fcm_token',
    NOTIFICATION_PERMISSION: '@notification_permission',
};

// =====================================================
// PERMISSION HANDLING
// =====================================================

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PERMISSION, enabled ? 'granted' : 'denied');

        if (enabled) {
            console.log('Notification permission granted');
            await getAndSaveFCMToken();
        }

        return enabled;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Check if notifications are enabled
 * @returns {Promise<boolean>}
 */
export const checkNotificationPermission = async () => {
    try {
        const authStatus = await messaging().hasPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    } catch (error) {
        console.error('Error checking notification permission:', error);
        return false;
    }
};

// =====================================================
// TOKEN MANAGEMENT
// =====================================================

/**
 * Get FCM token and save to Firebase
 * @returns {Promise<string|null>} FCM token
 */
export const getAndSaveFCMToken = async () => {
    try {
        const token = await messaging().getToken();

        if (token) {
            // Save locally
            await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);

            // Save to Firebase for the current user
            const user = getCurrentUser();
            if (user) {
                await updateData(`users/${user.uid}`, {
                    fcmToken: token,
                    fcmTokenUpdatedAt: new Date().toISOString(),
                    platform: Platform.OS,
                });
            }

            console.log('FCM Token saved:', token.substring(0, 20) + '...');
        }

        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Get stored FCM token
 * @returns {Promise<string|null>}
 */
export const getStoredFCMToken = async () => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
    } catch (error) {
        return null;
    }
};

/**
 * Listen for token refresh
 * @returns {function} Unsubscribe function
 */
export const onTokenRefresh = () => {
    return messaging().onTokenRefresh(async (token) => {
        console.log('FCM Token refreshed');
        await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);

        const user = getCurrentUser();
        if (user) {
            await updateData(`users/${user.uid}`, {
                fcmToken: token,
                fcmTokenUpdatedAt: new Date().toISOString(),
            });
        }
    });
};

// =====================================================
// NOTIFICATION HANDLERS
// =====================================================

/**
 * Handle foreground notifications
 * @param {function} callback - Callback function (remoteMessage) => {}
 * @returns {function} Unsubscribe function
 */
export const onForegroundNotification = (callback) => {
    return messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground notification received:', remoteMessage);

        // Show local alert for foreground notifications
        if (remoteMessage.notification) {
            Alert.alert(
                remoteMessage.notification.title || 'Notification',
                remoteMessage.notification.body || '',
                [{ text: 'OK' }]
            );
        }

        if (callback) {
            callback(remoteMessage);
        }
    });
};

/**
 * Handle notification opened (when user taps the notification)
 * @param {function} callback - Callback function (remoteMessage) => {}
 * @returns {function} Unsubscribe function
 */
export const onNotificationOpened = (callback) => {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened:', remoteMessage);
        if (callback) {
            callback(remoteMessage);
        }
    });
};

/**
 * Check if app was opened from a notification
 * @returns {Promise<object|null>} Initial notification data
 */
export const getInitialNotification = async () => {
    try {
        const remoteMessage = await messaging().getInitialNotification();
        if (remoteMessage) {
            console.log('App opened from notification:', remoteMessage);
        }
        return remoteMessage;
    } catch (error) {
        console.error('Error getting initial notification:', error);
        return null;
    }
};

/**
 * Set background message handler (should be called in index.js)
 * @param {function} callback - Callback function (remoteMessage) => {}
 */
export const setBackgroundMessageHandler = (callback) => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background notification received:', remoteMessage);
        if (callback) {
            callback(remoteMessage);
        }
    });
};

// =====================================================
// TOPIC SUBSCRIPTION
// =====================================================

/**
 * Subscribe to a topic for targeted notifications
 * @param {string} topic - Topic name (e.g., 'orders', 'promotions')
 */
export const subscribeToTopic = async (topic) => {
    try {
        await messaging().subscribeToTopic(topic);
        console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
    }
};

/**
 * Unsubscribe from a topic
 * @param {string} topic - Topic name
 */
export const unsubscribeFromTopic = async (topic) => {
    try {
        await messaging().unsubscribeFromTopic(topic);
        console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
};

// =====================================================
// INITIALIZATION
// =====================================================

/**
 * Initialize FCM and set up listeners
 * Call this in your App.js or main component
 * @param {object} options - Configuration options
 * @param {function} options.onNotificationReceived - Callback for foreground notifications
 * @param {function} options.onNotificationTapped - Callback when notification is tapped
 * @returns {Promise<{unsubscribeForeground: function, unsubscribeOpened: function, unsubscribeTokenRefresh: function}>}
 */
export const initializeNotifications = async (options = {}) => {
    try {
        // Request permissions
        const hasPermission = await checkNotificationPermission();
        if (!hasPermission) {
            await requestNotificationPermission();
        } else {
            // Just get the token if permission already granted
            await getAndSaveFCMToken();
        }

        // Set up listeners
        const unsubscribeForeground = onForegroundNotification(options.onNotificationReceived);
        const unsubscribeOpened = onNotificationOpened(options.onNotificationTapped);
        const unsubscribeTokenRefresh = onTokenRefresh();

        // Check if app was opened from notification
        const initialNotification = await getInitialNotification();
        if (initialNotification && options.onNotificationTapped) {
            options.onNotificationTapped(initialNotification);
        }

        // Subscribe to common topics
        await subscribeToTopic('allUsers');

        return {
            unsubscribeForeground,
            unsubscribeOpened,
            unsubscribeTokenRefresh,
        };
    } catch (error) {
        console.error('Error initializing notifications:', error);
        return {};
    }
};

export default {
    requestNotificationPermission,
    checkNotificationPermission,
    getAndSaveFCMToken,
    getStoredFCMToken,
    onTokenRefresh,
    onForegroundNotification,
    onNotificationOpened,
    getInitialNotification,
    setBackgroundMessageHandler,
    subscribeToTopic,
    unsubscribeFromTopic,
    initializeNotifications,
};
