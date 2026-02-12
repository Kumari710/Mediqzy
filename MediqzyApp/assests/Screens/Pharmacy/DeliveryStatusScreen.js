import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getOrderById, cancelOrder, createOrderNotification, onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function DeliveryStatusScreen({ navigation, route }) {
    const { orderId, order: initialOrder } = route.params || {};
    const [order, setOrder] = useState(initialOrder || null);
    const [loading, setLoading] = useState(!initialOrder);

    useEffect(() => {
        if (!orderId) return;

        const fetchAndSubscribe = async () => {
            // Initial fetch from allOrders for speed and unified lookup
            const res = await getOrderById(orderId);
            if (res.success) {
                setOrder({ id: orderId, ...res.data });
                setLoading(false);
            }

            // Real-time subscription
            const user = getCurrentUser();
            if (!user) return;

            // Try allOrders subscription too
            const unsubscribe = onDataChange(`pharmacyOrders/${user.uid}/${orderId}`, (data) => {
                if (data) {
                    setOrder({ id: orderId, ...data });
                    setLoading(false);
                }
            });
            return unsubscribe;
        };

        let unsub;
        fetchAndSubscribe().then(u => unsub = u);

        // Safety timeout
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            if (unsub) unsub();
            clearTimeout(timer);
        };
    }, [orderId]);

    const [cancelling, setCancelling] = useState(false);

    const getStatusStep = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'dispatched': return 2;
            case 'delivered': return 3;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const currentStep = getStatusStep(order?.status);

    const steps = [
        { title: 'Order Placed', time: order?.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '' },
        { title: 'Processing', time: 'Preparing your order' },
        { title: 'Out for Delivery', time: 'On the way to you' },
        { title: 'Delivered', time: 'Order completed' },
    ];

    const handleCancelOrder = () => {
        if (order?.status === 'delivered' || order?.status === 'cancelled') {
            Alert.alert('Cannot Cancel', 'This order cannot be cancelled.');
            return;
        }

        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order? This action cannot be undone.',
            [
                { text: 'No, Keep Order', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            const result = await cancelOrder(orderId, 'User cancelled');
                            if (result.success) {
                                // Create a notification for the cancellation
                                await createOrderNotification(orderId, 'cancelled');
                                Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.', [
                                    { text: 'OK', onPress: () => navigation.goBack() }
                                ]);
                            } else {
                                Alert.alert('Error', result.error || 'Failed to cancel order');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Something went wrong');
                        } finally {
                            setCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#23238E" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="alert-circle-outline" size={moderateScale(60)} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Order Not Found</Text>
                <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHomeBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Status</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Map View */}
                    <View style={styles.mapContainer}>
                        <Image
                            source={require('../../images/Map.png')}
                            style={styles.mapImage}
                            resizeMode="cover"
                        />
                        <View style={styles.routeContainer}>
                            <View style={styles.deliveryMarker}>
                                <Ionicons name="bicycle" size={moderateScale(22)} color="#fff" />
                            </View>
                        </View>
                    </View>

                    {/* Order Info Card */}
                    <View style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Image source={require('../../images/apollo.png')} style={styles.pharmacyLogo} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pharmacyName}>{order.pharmacy?.name || 'Pharmacy'}</Text>
                                <Text style={styles.orderId}>#{orderId?.slice(-8).toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: currentStep >= 3 ? '#D1FAE5' : '#DBEAFE' }]}>
                                <Text style={[styles.statusText, { color: currentStep >= 3 ? '#059669' : '#2563EB' }]}>
                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Items</Text>
                                <Text style={styles.infoValue}>{order.items?.length || 0}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Total</Text>
                                <Text style={styles.infoValueBold}>₹{order.total}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ETA</Text>
                                <Text style={styles.infoValue}>30-45 min</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tracking Steps */}
                    <View style={styles.trackingSection}>
                        <Text style={styles.sectionTitle}>Order Tracking</Text>

                        {steps.map((step, index) => (
                            <View key={index}>
                                <View style={styles.stepRow}>
                                    <View style={[styles.stepDot, index <= currentStep && styles.stepActive]}>
                                        {index < currentStep && (
                                            <Ionicons name="checkmark" size={moderateScale(10)} color="#fff" />
                                        )}
                                    </View>
                                    <View style={styles.stepInfo}>
                                        <Text style={[styles.stepTitle, index > currentStep && styles.textDisabled]}>
                                            {step.title}
                                        </Text>
                                        <Text style={styles.stepTime}>{step.time}</Text>
                                    </View>
                                    {index === currentStep && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentText}>Current</Text>
                                        </View>
                                    )}
                                </View>
                                {index < steps.length - 1 && (
                                    <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Items List */}
                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {order.items?.map((item, index) => {
                            // Determine correct image based on imageName
                            const getItemImage = () => {
                                if (item.imageName === 'drug2.png') {
                                    return require('../../images/drug2.png');
                                }
                                // Fallback check by name
                                const nameLower = (item.name || '').toLowerCase();
                                if (nameLower.includes('bodrex') || nameLower.includes('oskadon')) {
                                    return require('../../images/drug2.png');
                                }
                                return require('../../images/drug1.png');
                            };

                            return (
                                <View key={index} style={styles.itemRow}>
                                    <Image source={getItemImage()} style={styles.itemImage} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemDesc}>{item.desc}</Text>
                                    </View>
                                    <Text style={styles.itemQty}>x{item.qty}</Text>
                                    <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    {order?.status !== 'delivered' && order?.status !== 'cancelled' && (
                        <TouchableOpacity
                            style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
                            onPress={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle-outline" size={moderateScale(20)} color="#DC2626" />
                                    <Text style={styles.cancelBtnText}>Cancel Order</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.homeBtn}
                        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] })}
                    >
                        <Text style={styles.homeBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    safeArea: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#666' },
    emptyTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#374151', marginTop: verticalScale(16) },
    backHomeBtn: { backgroundColor: '#23238E', paddingHorizontal: scale(30), paddingVertical: verticalScale(12), borderRadius: scale(25), marginTop: verticalScale(20) },
    backHomeBtnText: { color: '#fff', fontWeight: '600', fontSize: moderateScale(14) },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        elevation: 2,
    },
    backBtn: { width: scale(40), padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },

    mapContainer: { height: verticalScale(200), position: 'relative' },
    mapImage: { width: '100%', height: '100%' },
    routeContainer: { position: 'absolute', bottom: verticalScale(20), right: wp(10) },
    deliveryMarker: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: '#23238E',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#23238E',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    orderCard: {
        margin: wp(4),
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
        elevation: 3,
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center' },
    pharmacyLogo: { width: scale(44), height: scale(44), borderRadius: scale(10), marginRight: scale(12) },
    pharmacyName: { fontWeight: '700', fontSize: moderateScale(16), color: '#1F2937' },
    orderId: { fontSize: moderateScale(12), color: '#9CA3AF', marginTop: verticalScale(2) },
    statusBadge: { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(20) },
    statusText: { fontWeight: '600', fontSize: moderateScale(12) },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: verticalScale(12) },
    infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
    infoItem: { alignItems: 'center' },
    infoLabel: { fontSize: moderateScale(12), color: '#9CA3AF' },
    infoValue: { fontSize: moderateScale(14), color: '#374151', fontWeight: '500', marginTop: verticalScale(4) },
    infoValueBold: { fontSize: moderateScale(16), color: '#23238E', fontWeight: '700', marginTop: verticalScale(4) },

    trackingSection: {
        marginHorizontal: wp(4),
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
    },
    sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: '#1F2937', marginBottom: verticalScale(16) },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepDot: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        backgroundColor: '#E5E7EB',
        marginRight: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: { backgroundColor: '#23238E' },
    stepInfo: { flex: 1 },
    stepTitle: { fontSize: moderateScale(14), fontWeight: '600', color: '#374151' },
    stepTime: { fontSize: moderateScale(12), color: '#9CA3AF', marginTop: verticalScale(2) },
    textDisabled: { color: '#D1D5DB' },
    currentBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: scale(10) },
    currentText: { fontSize: moderateScale(10), color: '#2563EB', fontWeight: '600' },
    stepLine: { width: 2, height: verticalScale(24), backgroundColor: '#E5E7EB', marginLeft: scale(9), marginVertical: verticalScale(4) },
    stepLineActive: { backgroundColor: '#23238E' },

    itemsSection: {
        margin: wp(4),
        marginTop: verticalScale(16),
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(10), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    itemImage: { width: scale(40), height: scale(40), borderRadius: scale(8), marginRight: scale(12) },
    itemName: { fontSize: moderateScale(14), fontWeight: '600', color: '#374151' },
    itemDesc: { fontSize: moderateScale(12), color: '#9CA3AF' },
    itemQty: { fontSize: moderateScale(14), color: '#6B7280', marginHorizontal: scale(10) },
    itemPrice: { fontSize: moderateScale(14), fontWeight: '700', color: '#23238E' },

    footer: {
        flexDirection: 'row',
        padding: wp(4),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: scale(12),
    },
    helpBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#23238E',
        borderRadius: scale(25),
        paddingVertical: verticalScale(14),
    },
    helpBtnText: { color: '#23238E', fontWeight: '600', fontSize: moderateScale(14), marginLeft: scale(8) },
    homeBtn: {
        flex: 1,
        backgroundColor: '#23238E',
        borderRadius: scale(25),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
    },
    homeBtnText: { color: '#fff', fontWeight: '600', fontSize: moderateScale(14) },
    cancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#DC2626',
        borderRadius: scale(25),
        paddingVertical: verticalScale(14),
        backgroundColor: '#FEF2F2',
    },
    cancelBtnText: { color: '#DC2626', fontWeight: '600', fontSize: moderateScale(14), marginLeft: scale(8) },
    btnDisabled: { opacity: 0.6 },
});
