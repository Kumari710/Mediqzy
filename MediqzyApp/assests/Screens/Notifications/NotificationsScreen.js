import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { queryData, removeData, updateData, onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import {
    subscribeToMessages,
    markMessageAsRead,
    markAllAsRead,
    MESSAGE_CATEGORIES,
} from '../../Utils/messageHistoryService';
import { navigateToOrder } from '../../Utils/unifiedBookingFlow';

const COLORS = {
    primary: '#23238E',
    background: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    cardBg: '#F8FAFC',
};

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load notifications when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    // Subscribe to real-time updates
    useEffect(() => {
        const user = getCurrentUser();
        if (!user) return;

        const unsubscribe = onDataChange(`notifications/${user.uid}`, (data) => {
            if (data) {
                const notifList = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                // Sort by createdAt descending (newest first)
                notifList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(notifList);
            } else {
                setNotifications([]);
            }
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const loadNotifications = async () => {
        const user = getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const result = await queryData(`notifications/${user.uid}`, {
                orderBy: 'createdAt',
                limitToLast: true,
                limit: 50
            });
            if (result.success && result.data) {
                // Standardize on 'id' instead of 'key'
                const formattedList = result.data.map(item => ({
                    id: item.key,
                    ...item
                }));
                setNotifications(formattedList.reverse());
            }
        } catch (error) {
            console.log('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const markAsRead = async (notifId) => {
        const user = getCurrentUser();
        if (!user) return;

        await updateData(`notifications/${user.uid}/${notifId}`, { read: true });
    };

    const handleNotificationPress = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead(notification.id);
            // Also mark in message history if it has an orderId
            if (notification.data?.orderId) {
                try {
                    await markMessageAsRead(notification.id);
                } catch (e) {
                    // Ignore if not in message history
                }
            }
        }

        // Navigate based on type and nested data
        const type = notification.type;
        const subType = notification.data?.type;

        // Handle order-related notifications using unified navigation
        if (notification.data?.orderId && notification.data?.orderType) {
            navigateToOrder(navigation, {
                orderId: notification.data.orderId,
                orderType: notification.data.orderType,
                ...notification.data,
            }, 'view_order');
            return;
        }

        if (subType === 'cart_add') {
            const cartType = notification.data?.cartType;
            navigation.navigate(cartType === 'lab' ? 'LabCartScreen' : 'PharmacyCartScreen');
        } else if (type === 'order' && notification.data?.orderId) {
            navigation.navigate('OrderDetailScreen', { orderId: notification.data.orderId });
        } else if (type === 'lab' && notification.data?.reportId) {
            navigation.navigate('ViewLabReportScreen', { reportId: notification.data.reportId });
        } else if (type === 'appointment' && notification.data?.appointmentId) {
            navigation.navigate('AppointmentDetailsScreen', { appointmentId: notification.data.appointmentId });
        } else if (type === 'lab_booking') {
            navigation.navigate('Records');
        }
    };

    const clearAllNotifications = () => {
        Alert.alert(
            'Clear All Notifications',
            'Are you sure you want to delete all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        const user = getCurrentUser();
                        if (user) {
                            await removeData(`notifications/${user.uid}`);
                            setNotifications([]);
                        }
                    },
                },
            ]
        );
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return 'bag-check-outline';
            case 'lab': return 'document-text-outline';
            case 'lab_booking': return 'flask-outline';
            case 'appointment': return 'calendar-outline';
            case 'medicine': return 'medkit-outline';
            case 'health': return 'heart-outline';
            case 'promo': return 'pricetag-outline';
            case 'cart': return 'cart-outline';
            default: return 'notifications-outline';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('NotificationSettingsScreen')}
                        style={styles.settingsButton}
                    >
                        <Ionicons name="settings-outline" size={moderateScale(22)} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={moderateScale(80)} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyText}>You're all caught up!</Text>
                    </View>
                ) : (
                    <>
                        {/* Clear All Button */}
                        <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllNotifications}>
                            <Ionicons name="trash-outline" size={moderateScale(16)} color="#EF4444" />
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[COLORS.primary]}
                                />
                            }
                        >
                            {notifications.map((notification) => (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        !notification.read && styles.unreadCard,
                                    ]}
                                    onPress={() => handleNotificationPress(notification)}
                                >
                                    <View style={[styles.iconContainer, !notification.read && styles.iconUnread]}>
                                        <Ionicons
                                            name={getNotificationIcon(notification.type)}
                                            size={moderateScale(22)}
                                            color={COLORS.primary}
                                        />
                                    </View>
                                    <View style={styles.contentContainer}>
                                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                                        <Text style={styles.notificationMessage} numberOfLines={2}>
                                            {notification.message}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {formatTime(notification.createdAt)}
                                        </Text>
                                    </View>
                                    {!notification.read && <View style={styles.unreadDot} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}
            </SafeAreaView>
        </View>
    );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#666' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { padding: scale(5), width: scale(40) },
    headerTitle: { fontSize: moderateScale(20), fontWeight: '700', color: COLORS.primary },
    settingsButton: { padding: scale(5), width: scale(40), alignItems: 'flex-end' },

    clearAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
    },
    clearAllText: { fontSize: moderateScale(13), color: '#EF4444', fontWeight: '600', marginLeft: scale(4) },

    scrollContent: { paddingHorizontal: wp(4), paddingBottom: hp(4) },

    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBg,
        borderRadius: scale(14),
        padding: scale(16),
        marginBottom: verticalScale(12),
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    unreadCard: {
        backgroundColor: '#EEF4FF',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    iconUnread: { backgroundColor: '#DBEAFE' },
    contentContainer: { flex: 1 },
    notificationTitle: { fontSize: moderateScale(15), fontWeight: '600', color: COLORS.textPrimary, marginBottom: verticalScale(4) },
    notificationMessage: { fontSize: moderateScale(13), color: COLORS.textSecondary, lineHeight: moderateScale(20), marginBottom: verticalScale(6) },
    notificationTime: { fontSize: moderateScale(11), color: COLORS.textSecondary },
    unreadDot: { width: scale(10), height: scale(10), borderRadius: scale(5), backgroundColor: COLORS.primary, marginLeft: scale(8) },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: hp(10) },
    emptyTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#374151', marginTop: verticalScale(20) },
    emptyText: { fontSize: moderateScale(14), color: '#9CA3AF', marginTop: verticalScale(8) },
});
