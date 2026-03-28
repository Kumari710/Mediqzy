import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    StatusBar,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getData, updateData } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

const COLORS = {
    primary: '#23238E',
    secondary: '#3B4FBF',
    white: '#FFFFFF',
    background: '#F8FAFC',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    primaryLight: '#E0E7FF',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
};

const statusTimeline = [
    { key: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle', description: 'Your order has been received' },
    { key: 'assigned', label: 'Agent Assigned', icon: 'person', description: 'A phlebotomist has been assigned' },
    { key: 'on_the_way', label: 'On the Way', icon: 'bicycle', description: 'Agent is heading to your location' },
    { key: 'arrived', label: 'Arrived', icon: 'location', description: 'Agent has reached your location' },
    { key: 'collected', label: 'Sample Collected', icon: 'flask', description: 'Sample collected successfully' },
];

export default function CollectionDetailsScreen({ navigation, route }) {
    const { order: initialOrder, orderId } = route.params || {};
    const [order, setOrder] = useState(initialOrder || null);
    const [loading, setLoading] = useState(!initialOrder && !!orderId);
    const [currentStatus, setCurrentStatus] = useState('confirmed');
    const [statusHistory, setStatusHistory] = useState([]);
    const statusTimer = useRef(null);

    useEffect(() => {
        if (orderId && !initialOrder) {
            fetchOrder(orderId);
        } else if (initialOrder) {
            setOrder(initialOrder);
            setCurrentStatus(initialOrder.collectionStatus || initialOrder.status || 'confirmed');
            loadStatusHistory(initialOrder);
        }

        return () => {
            if (statusTimer.current) clearTimeout(statusTimer.current);
        };
    }, [orderId, initialOrder]);

    // Simulate real-time status updates (in production, this would be a Firebase listener)
    useEffect(() => {
        if (currentStatus === 'on_the_way') {
            statusTimer.current = setTimeout(() => {
                updateOrderStatus('arrived');
            }, 8000); // Simulate arrival after 8 seconds
        }
        return () => {
            if (statusTimer.current) clearTimeout(statusTimer.current);
        };
    }, [currentStatus]);

    const fetchOrder = async (id) => {
        setLoading(true);
        try {
            const user = getCurrentUser();
            if (user) {
                const result = await getData(`labOrders/${user.uid}/${id}`);
                if (result.success && result.data) {
                    const orderData = { id, ...result.data };
                    setOrder(orderData);
                    setCurrentStatus(orderData.collectionStatus || orderData.status || 'confirmed');
                    loadStatusHistory(orderData);
                }
            }
        } catch (error) {
            console.warn('Error fetching order:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadStatusHistory = (orderData) => {
        const history = orderData.statusHistory || [];
        if (history.length === 0) {
            // Initialize with confirmed status
            history.push({
                status: 'confirmed',
                timestamp: orderData.createdAt || Date.now(),
            });
        }
        setStatusHistory(history);
    };

    const updateOrderStatus = async (newStatus) => {
        try {
            const user = getCurrentUser();
            if (user && order) {
                const timestamp = Date.now();
                const newHistoryEntry = { status: newStatus, timestamp };

                const updatedHistory = [...statusHistory, newHistoryEntry];
                setStatusHistory(updatedHistory);
                setCurrentStatus(newStatus);

                // Update in Firebase
                await updateData(`labOrders/${user.uid}/${order.id || orderId}`, {
                    collectionStatus: newStatus,
                    status: newStatus,
                    statusHistory: updatedHistory,
                    updatedAt: timestamp,
                });

                setOrder(prev => ({ ...prev, collectionStatus: newStatus, status: newStatus }));
            }
        } catch (error) {
            console.warn('Error updating status:', error.message);
        }
    };

    const handleMarkSampleCollected = () => {
        Alert.alert(
            'Confirm Sample Collection',
            'Are you sure the sample has been collected successfully?',
            [
                { text: 'Not Yet', style: 'cancel' },
                {
                    text: 'Yes, Collected',
                    onPress: async () => {
                        await updateOrderStatus('collected');
                        navigation.navigate('SampleCollectedScreen', { order, orderId: order?.id || orderId });
                    },
                },
            ]
        );
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Cancel Collection',
            'Are you sure you want to cancel this sample collection? This cannot be undone.',
            [
                { text: 'Keep It', style: 'cancel' },
                {
                    text: 'Cancel Order',
                    style: 'destructive',
                    onPress: async () => {
                        await updateOrderStatus('cancelled');
                        Alert.alert('Order Cancelled', 'Your sample collection has been cancelled.');
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleCallAgent = () => {
        const phoneNumber = order?.agent?.phone || '+919876543210';
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleChatAgent = () => {
        navigation.navigate('DoctorChatScreen', {
            type: 'agent',
            agentName: order?.agent?.name || 'Phlebotomist',
            orderId: order?.id || orderId,
        });
    };

    const getStatusIndex = (status) => {
        return statusTimeline.findIndex(s => s.key === status);
    };

    const currentStatusIndex = getStatusIndex(currentStatus);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading collection details...</Text>
            </View>
        );
    }

    // Normalize order data
    const testName = order?.items?.[0]?.name || order?.tests?.[0]?.name || 'Lab Test';
    const labName = order?.provider?.name || order?.labName || 'Apollo Diagnostics';
    const orderIdDisplay = order?.orderId || order?.id?.slice(-8).toUpperCase() || 'LAB-XXXXX';
    const collectionAddress = order?.address?.address || order?.collectionAddress || '123, 4th Cross Street, T. Nagar, Chennai - 600017';
    const timeSlot = order?.schedule?.timeSlot || order?.timeSlot || '08:00 AM - 10:00 AM';

    const agentInfo = order?.agent || {
        name: 'Priya Sharma',
        phone: '+91 98765 43210',
        photo: null,
        rating: 4.8,
        experience: '3 years',
        collections: 2450,
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Track Collection</Text>
                    <TouchableOpacity style={styles.helpBtn}>
                        <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Order Info Banner */}
                    <View style={styles.orderInfoBanner}>
                        <View style={styles.orderInfoLeft}>
                            <Text style={styles.orderIdLabel}>Order ID</Text>
                            <Text style={styles.orderIdValue}>{orderIdDisplay}</Text>
                        </View>
                        <View style={styles.orderInfoRight}>
                            <Image source={require('../../images/apollo.png')} style={styles.labLogoSmall} />
                            <Text style={styles.labNameSmall}>{labName}</Text>
                        </View>
                    </View>

                    {/* Agent Card */}
                    <View style={styles.agentCard}>
                        <View style={styles.agentHeader}>
                            <Text style={styles.agentTitle}>Your Phlebotomist</Text>
                            <View style={[
                                styles.statusBadge,
                                currentStatus === 'on_the_way' && styles.statusBadgeWarning,
                                currentStatus === 'arrived' && styles.statusBadgeSuccess,
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    currentStatus === 'on_the_way' && styles.statusBadgeTextWarning,
                                    currentStatus === 'arrived' && styles.statusBadgeTextSuccess,
                                ]}>
                                    {currentStatus === 'on_the_way' ? 'En Route' :
                                        currentStatus === 'arrived' ? 'Arrived' : 'Assigned'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.agentInfo}>
                            <View style={styles.agentAvatarBox}>
                                {agentInfo.photo ? (
                                    <Image source={{ uri: agentInfo.photo }} style={styles.agentPhoto} />
                                ) : (
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.secondary]}
                                        style={styles.agentPhotoPlaceholder}
                                    >
                                        <Text style={styles.agentInitials}>{agentInfo.name?.charAt(0) || 'P'}</Text>
                                    </LinearGradient>
                                )}
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                </View>
                            </View>

                            <View style={styles.agentDetails}>
                                <Text style={styles.agentName}>{agentInfo.name}</Text>
                                <View style={styles.agentMeta}>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#FFB800" />
                                        <Text style={styles.ratingText}>{agentInfo.rating}</Text>
                                    </View>
                                    <Text style={styles.agentExp}>{agentInfo.experience}</Text>
                                    <Text style={styles.agentCollections}>{agentInfo.collections}+ collections</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.agentActions}>
                            <TouchableOpacity style={styles.agentActionBtn} onPress={handleCallAgent}>
                                <Ionicons name="call" size={22} color={COLORS.primary} />
                                <Text style={styles.agentActionText}>Call</Text>
                            </TouchableOpacity>
                            <View style={styles.actionDivider} />
                            <TouchableOpacity style={styles.agentActionBtn} onPress={handleChatAgent}>
                                <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.primary} />
                                <Text style={styles.agentActionText}>Chat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Status Timeline */}
                    <View style={styles.timelineCard}>
                        <Text style={styles.timelineTitle}>Collection Status</Text>

                        <View style={styles.timeline}>
                            {statusTimeline.map((step, index) => {
                                const isCompleted = index < currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const isPending = index > currentStatusIndex;
                                const historyEntry = statusHistory.find(h => h.status === step.key);
                                const timestamp = historyEntry?.timestamp
                                    ? new Date(historyEntry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                    : '';

                                return (
                                    <View key={step.key} style={styles.timelineItem}>
                                        <View style={styles.timelineLeft}>
                                            <View
                                                style={[
                                                    styles.timelineDot,
                                                    isCompleted && styles.timelineDotCompleted,
                                                    isCurrent && styles.timelineDotCurrent,
                                                ]}
                                            >
                                                <Ionicons
                                                    name={isCompleted ? 'checkmark' : step.icon}
                                                    size={14}
                                                    color={isPending ? COLORS.textSecondary : COLORS.white}
                                                />
                                            </View>
                                            {index < statusTimeline.length - 1 && (
                                                <View
                                                    style={[
                                                        styles.timelineLine,
                                                        isCompleted && styles.timelineLineCompleted,
                                                    ]}
                                                />
                                            )}
                                        </View>

                                        <View style={styles.timelineContent}>
                                            <View style={styles.timelineHeader}>
                                                <Text
                                                    style={[
                                                        styles.timelineLabel,
                                                        (isCompleted || isCurrent) && styles.timelineLabelActive,
                                                    ]}
                                                >
                                                    {step.label}
                                                </Text>
                                                {timestamp && (
                                                    <Text style={styles.timelineTime}>{timestamp}</Text>
                                                )}
                                            </View>
                                            <Text style={styles.timelineDesc}>{step.description}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Collection Address */}
                    <View style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                            <Ionicons name="location" size={22} color={COLORS.primary} />
                            <Text style={styles.addressTitle}>Collection Address</Text>
                        </View>
                        <Text style={styles.addressText}>{collectionAddress}</Text>
                        <View style={styles.addressMeta}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.addressMetaText}>Time Slot: {timeSlot}</Text>
                        </View>
                    </View>

                    {/* Test Info */}
                    <View style={styles.testInfoCard}>
                        <View style={styles.testIconBox}>
                            <Ionicons name="flask" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.testInfo}>
                            <Text style={styles.testName}>{testName}</Text>
                            <Text style={styles.testLab}>{labName}</Text>
                        </View>
                    </View>

                    <View style={{ height: hp(18) }} />
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.bottomBar}>
                    {currentStatus === 'arrived' ? (
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleMarkSampleCollected}>
                            <LinearGradient
                                colors={[COLORS.success, '#059669']}
                                style={styles.btnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                                <Text style={styles.primaryBtnText}>Mark Sample Collected</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : currentStatus === 'collected' ? (
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => navigation.navigate('SampleCollectedScreen', { order, orderId: order?.id || orderId })}
                        >
                            <LinearGradient
                                colors={[COLORS.success, '#059669']}
                                style={styles.btnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="flask" size={22} color={COLORS.white} />
                                <Text style={styles.primaryBtnText}>View Collection Details</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.bottomActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                                <Text style={styles.cancelBtnText}>Cancel Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.trackBtn}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.secondary]}
                                    style={styles.btnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="navigate" size={18} color={COLORS.white} />
                                    <Text style={styles.trackBtnText}>Track on Map</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    safeArea: { flex: 1 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(15), color: COLORS.textSecondary, fontSize: moderateScale(14) },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '800', color: COLORS.text },
    helpBtn: {
        width: scale(40),
        height: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: { paddingBottom: hp(5) },
    orderInfoBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        backgroundColor: COLORS.white,
        padding: moderateScale(16),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    orderInfoLeft: {},
    orderIdLabel: { fontSize: moderateScale(11), color: COLORS.textSecondary },
    orderIdValue: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text, marginTop: verticalScale(2) },
    orderInfoRight: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
    labLogoSmall: { width: scale(28), height: scale(28), borderRadius: moderateScale(6) },
    labNameSmall: { fontSize: moderateScale(13), color: COLORS.primary, fontWeight: '600' },
    agentCard: {
        marginHorizontal: wp(5),
        marginTop: hp(2),
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    agentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(15) },
    agentTitle: { fontSize: moderateScale(14), fontWeight: '600', color: COLORS.textSecondary },
    statusBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: moderateScale(8) },
    statusBadgeWarning: { backgroundColor: COLORS.warningLight },
    statusBadgeSuccess: { backgroundColor: COLORS.successLight },
    statusBadgeText: { fontSize: moderateScale(11), fontWeight: '700', color: COLORS.primary },
    statusBadgeTextWarning: { color: COLORS.warning },
    statusBadgeTextSuccess: { color: COLORS.success },
    agentInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(20) },
    agentAvatarBox: { position: 'relative', marginRight: scale(15) },
    agentPhoto: { width: scale(60), height: scale(60), borderRadius: scale(30) },
    agentPhotoPlaceholder: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    agentInitials: { fontSize: moderateScale(22), fontWeight: '700', color: COLORS.white },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderRadius: scale(10),
    },
    agentDetails: { flex: 1 },
    agentName: { fontSize: moderateScale(17), fontWeight: '700', color: COLORS.text },
    agentMeta: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(6), gap: scale(8), flexWrap: 'wrap' },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(4),
        gap: scale(2),
    },
    ratingText: { fontSize: moderateScale(11), fontWeight: '700', color: '#92400E' },
    agentExp: { fontSize: moderateScale(12), color: COLORS.textSecondary },
    agentCollections: { fontSize: moderateScale(12), color: COLORS.textSecondary },
    agentActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: verticalScale(15),
    },
    agentActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8) },
    agentActionText: { fontSize: moderateScale(14), fontWeight: '600', color: COLORS.primary },
    actionDivider: { width: 1, height: '100%', backgroundColor: COLORS.border },
    timelineCard: {
        marginHorizontal: wp(5),
        marginTop: hp(2),
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
    },
    timelineTitle: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(20) },
    timeline: {},
    timelineItem: { flexDirection: 'row' },
    timelineLeft: { alignItems: 'center', marginRight: scale(15) },
    timelineDot: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineDotCompleted: { backgroundColor: COLORS.success },
    timelineDotCurrent: { backgroundColor: COLORS.primary },
    timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: verticalScale(4) },
    timelineLineCompleted: { backgroundColor: COLORS.success },
    timelineContent: { flex: 1, paddingBottom: verticalScale(20) },
    timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timelineLabel: { fontSize: moderateScale(14), fontWeight: '600', color: COLORS.textSecondary },
    timelineLabelActive: { color: COLORS.text, fontWeight: '700' },
    timelineTime: { fontSize: moderateScale(11), color: COLORS.textSecondary },
    timelineDesc: { fontSize: moderateScale(12), color: COLORS.textSecondary, marginTop: verticalScale(4) },
    addressCard: {
        marginHorizontal: wp(5),
        marginTop: hp(2),
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(16),
        padding: moderateScale(20),
    },
    addressHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(10), marginBottom: verticalScale(10) },
    addressTitle: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text },
    addressText: { fontSize: moderateScale(14), color: COLORS.textSecondary, lineHeight: moderateScale(22) },
    addressMeta: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(12), gap: scale(6) },
    addressMetaText: { fontSize: moderateScale(13), color: COLORS.textSecondary },
    testInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
    },
    testIconBox: {
        width: scale(48),
        height: scale(48),
        borderRadius: moderateScale(12),
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(15),
    },
    testInfo: { flex: 1 },
    testName: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text },
    testLab: { fontSize: moderateScale(12), color: COLORS.textSecondary, marginTop: verticalScale(2) },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    primaryBtn: { borderRadius: moderateScale(16), overflow: 'hidden' },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(16),
        gap: scale(10),
    },
    primaryBtnText: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '700' },
    bottomActions: { flexDirection: 'row', gap: scale(12) },
    cancelBtn: {
        flex: 0.4,
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: { color: COLORS.danger, fontSize: moderateScale(14), fontWeight: '600' },
    trackBtn: { flex: 0.6, borderRadius: moderateScale(16), overflow: 'hidden' },
    trackBtnText: { color: COLORS.white, fontSize: moderateScale(14), fontWeight: '700' },
});
