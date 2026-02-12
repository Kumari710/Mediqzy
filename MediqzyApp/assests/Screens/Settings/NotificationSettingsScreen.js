import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    StatusBar,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    checkNotificationPermission,
    requestNotificationPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
} from '../../Utils/firebaseMessaging';
import {
    getSoundEnabled,
    setSoundEnabled,
    getVibrationEnabled,
    setVibrationEnabled,
    getMedicineReminders,
} from '../../Utils/localNotifications';
import { updateData } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
    ORDER_NOTIFICATIONS: '@settings_order_notifications',
    PROMO_NOTIFICATIONS: '@settings_promo_notifications',
    HEALTH_REMINDERS: '@settings_health_reminders',
};

export default function NotificationSettingsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [orderNotifications, setOrderNotifications] = useState(true);
    const [promoNotifications, setPromoNotifications] = useState(true);
    const [healthReminders, setHealthReminders] = useState(true);
    const [soundEnabled, setSoundEnabledState] = useState(true);
    const [vibrationEnabled, setVibrationEnabledState] = useState(true);
    const [reminderCount, setReminderCount] = useState(0);

    useEffect(() => {
        loadSettings();
    }, []);

    // Reload reminder count when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadReminderCount();
        });
        return unsubscribe;
    }, [navigation]);

    const loadSettings = async () => {
        try {
            // Check system permission
            const hasPermission = await checkNotificationPermission();
            setNotificationsEnabled(hasPermission);

            // Load individual settings
            const orderSetting = await AsyncStorage.getItem(SETTINGS_KEYS.ORDER_NOTIFICATIONS);
            const promoSetting = await AsyncStorage.getItem(SETTINGS_KEYS.PROMO_NOTIFICATIONS);
            const healthSetting = await AsyncStorage.getItem(SETTINGS_KEYS.HEALTH_REMINDERS);

            setOrderNotifications(orderSetting !== 'false');
            setPromoNotifications(promoSetting !== 'false');
            setHealthReminders(healthSetting !== 'false');

            // Load sound and vibration settings
            const sound = await getSoundEnabled();
            const vibration = await getVibrationEnabled();
            setSoundEnabledState(sound);
            setVibrationEnabledState(vibration);

            // Load reminder count
            await loadReminderCount();
        } catch (error) {
            console.log('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadReminderCount = async () => {
        const reminders = await getMedicineReminders();
        setReminderCount(reminders.length);
    };

    const handleMasterToggle = async (value) => {
        if (value) {
            const granted = await requestNotificationPermission();
            if (granted) {
                setNotificationsEnabled(true);
                await subscribeToTopic('allUsers');
            } else {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive updates.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }
        } else {
            Alert.alert(
                'Disable Notifications',
                'You will no longer receive any notifications from the app. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Disable',
                        style: 'destructive',
                        onPress: async () => {
                            setNotificationsEnabled(false);
                            await unsubscribeFromTopic('allUsers');
                            const user = getCurrentUser();
                            if (user) {
                                await updateData(`users/${user.uid}`, { notificationsEnabled: false });
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleOrderNotifications = async (value) => {
        setOrderNotifications(value);
        await AsyncStorage.setItem(SETTINGS_KEYS.ORDER_NOTIFICATIONS, value.toString());
        value ? await subscribeToTopic('orders') : await unsubscribeFromTopic('orders');
        const user = getCurrentUser();
        if (user) await updateData(`users/${user.uid}/preferences`, { orderNotifications: value });
    };

    const handlePromoNotifications = async (value) => {
        setPromoNotifications(value);
        await AsyncStorage.setItem(SETTINGS_KEYS.PROMO_NOTIFICATIONS, value.toString());
        value ? await subscribeToTopic('promotions') : await unsubscribeFromTopic('promotions');
        const user = getCurrentUser();
        if (user) await updateData(`users/${user.uid}/preferences`, { promoNotifications: value });
    };

    const handleHealthReminders = async (value) => {
        setHealthReminders(value);
        await AsyncStorage.setItem(SETTINGS_KEYS.HEALTH_REMINDERS, value.toString());
        value ? await subscribeToTopic('healthReminders') : await unsubscribeFromTopic('healthReminders');
        const user = getCurrentUser();
        if (user) await updateData(`users/${user.uid}/preferences`, { healthReminders: value });
    };

    const handleSoundToggle = async (value) => {
        setSoundEnabledState(value);
        await setSoundEnabled(value);
    };

    const handleVibrationToggle = async (value) => {
        setVibrationEnabledState(value);
        await setVibrationEnabled(value);
    };

    const SettingItem = ({ icon, title, subtitle, value, onValueChange, disabled }) => (
        <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={moderateScale(24)} color={disabled ? '#9CA3AF' : '#23238E'} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, disabled && styles.textDisabled]}>{title}</Text>
                <Text style={[styles.settingSubtitle, disabled && styles.textDisabled]}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={value ? '#23238E' : '#9CA3AF'}
            />
        </View>
    );

    const LinkItem = ({ icon, title, subtitle, onPress, badge }) => (
        <TouchableOpacity style={styles.linkItem} onPress={onPress}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={moderateScale(24)} color="#23238E" />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            {badge > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notification Settings</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Master Toggle */}
                    <View style={styles.masterSection}>
                        <View style={styles.masterToggle}>
                            <View style={styles.masterInfo}>
                                <Ionicons name="notifications" size={moderateScale(32)} color="#23238E" />
                                <View style={{ marginLeft: scale(16), flex: 1 }}>
                                    <Text style={styles.masterTitle}>Push Notifications</Text>
                                    <Text style={styles.masterSubtitle}>
                                        {notificationsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleMasterToggle}
                                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                                thumbColor={notificationsEnabled ? '#23238E' : '#9CA3AF'}
                            />
                        </View>
                    </View>

                    {/* Sound & Vibration */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sound & Vibration</Text>

                        <SettingItem
                            icon="volume-high-outline"
                            title="Notification Sound"
                            subtitle="Play sound for notifications"
                            value={soundEnabled}
                            onValueChange={handleSoundToggle}
                            disabled={!notificationsEnabled}
                        />

                        <SettingItem
                            icon="phone-portrait-outline"
                            title="Vibration"
                            subtitle="Vibrate for notifications"
                            value={vibrationEnabled}
                            onValueChange={handleVibrationToggle}
                            disabled={!notificationsEnabled}
                        />
                    </View>

                    {/* Notification Types */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notification Types</Text>

                        <SettingItem
                            icon="bag-check-outline"
                            title="Order Updates"
                            subtitle="Get notified about your order status"
                            value={orderNotifications}
                            onValueChange={handleOrderNotifications}
                            disabled={!notificationsEnabled}
                        />

                        <SettingItem
                            icon="pricetag-outline"
                            title="Promotions & Offers"
                            subtitle="Receive special deals and discounts"
                            value={promoNotifications}
                            onValueChange={handlePromoNotifications}
                            disabled={!notificationsEnabled}
                        />

                        <SettingItem
                            icon="heart-outline"
                            title="Health Reminders"
                            subtitle="Medicine and appointment reminders"
                            value={healthReminders}
                            onValueChange={handleHealthReminders}
                            disabled={!notificationsEnabled}
                        />
                    </View>

                    {/* Medicine Reminders */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Scheduled Reminders</Text>

                        <LinkItem
                            icon="medical-outline"
                            title="Medicine Reminders"
                            subtitle="Set daily reminders for your medicines"
                            onPress={() => navigation.navigate('MedicineReminderScreen')}
                            badge={reminderCount}
                        />
                    </View>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={moderateScale(24)} color="#3B82F6" />
                        <Text style={styles.infoText}>
                            Medicine reminders will notify you at your set times daily, even when the app is closed.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { width: scale(40), padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },

    scrollView: { flex: 1 },

    masterSection: {
        backgroundColor: '#fff',
        marginTop: verticalScale(16),
        marginHorizontal: wp(4),
        borderRadius: scale(16),
        padding: scale(20),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    masterToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    masterInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    masterTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#1F2937' },
    masterSubtitle: { fontSize: moderateScale(13), color: '#6B7280', marginTop: verticalScale(4) },

    section: {
        backgroundColor: '#fff',
        marginTop: verticalScale(16),
        marginHorizontal: wp(4),
        borderRadius: scale(16),
        padding: scale(16),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: verticalScale(12),
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingItemDisabled: { opacity: 0.5 },
    settingIconContainer: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingInfo: { flex: 1, marginLeft: scale(12) },
    settingTitle: { fontSize: moderateScale(15), fontWeight: '600', color: '#1F2937' },
    settingSubtitle: { fontSize: moderateScale(12), color: '#6B7280', marginTop: verticalScale(2) },
    textDisabled: { color: '#9CA3AF' },

    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(14),
    },
    badge: {
        backgroundColor: '#23238E',
        borderRadius: scale(10),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        marginRight: scale(8),
    },
    badgeText: { color: '#fff', fontSize: moderateScale(12), fontWeight: '600' },

    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        marginHorizontal: wp(4),
        marginTop: verticalScale(16),
        marginBottom: verticalScale(32),
        borderRadius: scale(12),
        padding: scale(16),
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#1E40AF',
        marginLeft: scale(12),
        lineHeight: moderateScale(20),
    },
});
