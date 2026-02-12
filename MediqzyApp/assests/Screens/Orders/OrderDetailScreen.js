import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getOrderById } from '../../Utils/firebaseDatabase';

export default function OrderDetailScreen({ navigation, route }) {
    const { order: initialOrder, orderId } = route.params || {};
    const [order, setOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(!initialOrder && !!orderId);

    useEffect(() => {
        if (!order && orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        setLoading(true);
        const result = await getOrderById(orderId);
        if (result.success) {
            setOrder(result.data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#23238E" />
                <Text style={styles.loadingText}>Fetching order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Ionicons name="alert-circle-outline" size={moderateScale(48)} color="#666" />
                <Text style={styles.errorText}>Order not found</Text>
                <TouchableOpacity style={styles.backBtnSmall} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isLab = order.type === 'lab';

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#059669';
            case 'cancelled': return '#DC2626';
            case 'processing':
            case 'on-going':
            case 'dispatched': return '#2563EB';
            default: return '#D97706';
        }
    };

    // Product names that use drug2.png
    const DRUG2_PRODUCTS = ['bodrex', 'oskadon'];

    // Get item image based on type and item data
    const getItemImage = (item) => {
        if (isLab) {
            return require('../../images/labtest.png');
        }
        // Check imageName first
        if (item.imageName === 'drug2.png') {
            return require('../../images/drug2.png');
        }
        // Fallback: check by product name
        const nameLower = (item.name || '').toLowerCase();
        if (DRUG2_PRODUCTS.some(name => nameLower.includes(name))) {
            return require('../../images/drug2.png');
        }
        return require('../../images/drug1.png');
    };

    const renderItem = (item, index) => (
        <View key={index} style={styles.itemRow}>
            <Image
                source={getItemImage(item)}
                style={styles.itemImage}
                resizeMode="contain"
            />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSub}>{isLab ? '1 Test' : `${item.qty || 1} Unit(s)`}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price || 0}</Text>
        </View>
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
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Order Info */}
                    <View style={styles.section}>
                        <View style={styles.orderHeaderRow}>
                            <View>
                                <Text style={styles.orderIdLabel}>Order ID</Text>
                                <Text style={styles.orderIdValue}>#{order.orderId || order.id?.slice(-8).toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                    {order.status || 'Pending'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.orderDate}>
                            {order.createdAt
                                ? new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'Date not available'}
                        </Text>
                    </View>

                    {/* Pharmacy/Lab Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{isLab ? 'Lab Information' : 'Pharmacy Information'}</Text>
                        <View style={styles.providerCard}>
                            <Image
                                source={isLab ? require('../../images/apollo.png') : require('../../images/pharmacy.png')}
                                style={styles.providerLogo}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.providerName}>{isLab ? (order.labName || 'Apollo Labs') : (order.pharmacy?.name || 'Pharmacy')}</Text>
                                <Text style={styles.providerAddress}>{isLab ? (order.labAddress || 'T.nagar, Chennai') : 'Home Delivery Service'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Items Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Items Ordered</Text>
                        <View style={styles.itemsContainer}>
                            {order.items && Array.isArray(order.items) ? (
                                order.items.map((item, index) => renderItem(item, index))
                            ) : (
                                <Text style={styles.noItemsText}>No items found in this order</Text>
                            )}
                        </View>
                    </View>

                    {/* Payment Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.billContainer}>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Subtotal</Text>
                                <Text style={styles.billValue}>₹{order.summary?.subtotal || (parseFloat(order.total || 0) - 50)}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Delivery/Collection Charges</Text>
                                <Text style={styles.billValue}>₹{order.summary?.collectionCharge || 50}</Text>
                            </View>
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Taxes & GST</Text>
                                <Text style={styles.billValue}>₹{order.summary?.tax || 0}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.billRow}>
                                <Text style={styles.totalLabel}>Total Amount Paid</Text>
                                <Text style={styles.totalValue}>₹{order.total || order.summary?.total || 0}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tracking Button */}
                    <TouchableOpacity
                        style={styles.trackBtn}
                        onPress={() => {
                            if (isLab) {
                                navigation.navigate('CollectionDetailsScreen', { orderId: order.id, order });
                            } else {
                                navigation.navigate('DeliveryStatusScreen', { orderId: order.id, order });
                            }
                        }}
                    >
                        <Ionicons name="location-outline" size={moderateScale(20)} color="#fff" />
                        <Text style={styles.trackBtnText}>Track Order Live</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: verticalScale(12),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: { padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
    scrollContent: { paddingBottom: hp(5) },
    section: {
        backgroundColor: '#fff',
        padding: moderateScale(20),
        marginBottom: verticalScale(8),
    },
    orderHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderIdLabel: { fontSize: moderateScale(12), color: '#888', textTransform: 'uppercase' },
    orderIdValue: { fontSize: moderateScale(16), fontWeight: '700', color: '#222', marginTop: 2 },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(8),
    },
    statusText: { fontSize: moderateScale(12), fontWeight: '700' },
    orderDate: { fontSize: moderateScale(13), color: '#666', marginTop: verticalScale(8) },
    sectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: '#222',
        marginBottom: verticalScale(16),
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: scale(12),
        borderRadius: scale(12),
    },
    providerLogo: { width: scale(40), height: scale(40), borderRadius: scale(8), marginRight: scale(12) },
    providerName: { fontSize: moderateScale(14), fontWeight: '700', color: '#222' },
    providerAddress: { fontSize: moderateScale(12), color: '#888', marginTop: 2 },
    itemsContainer: { gap: verticalScale(12) },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: scale(12),
        borderRadius: scale(12),
        marginBottom: verticalScale(8),
    },
    itemImage: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        backgroundColor: '#fff',
        marginRight: scale(12),
    },
    itemDetails: { flex: 1 },
    itemName: { fontSize: moderateScale(14), fontWeight: '600', color: '#333' },
    itemSub: { fontSize: moderateScale(12), color: '#888', marginTop: 2 },
    itemPrice: { fontSize: moderateScale(14), fontWeight: '700', color: '#23238E' },
    billContainer: { gap: verticalScale(8) },
    billRow: { flexDirection: 'row', justifyContent: 'space-between' },
    billLabel: { fontSize: moderateScale(13), color: '#666' },
    billValue: { fontSize: moderateScale(13), color: '#222', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: verticalScale(8) },
    totalLabel: { fontSize: moderateScale(15), fontWeight: '700', color: '#222' },
    totalValue: { fontSize: moderateScale(17), fontWeight: '800', color: '#23238E' },
    trackBtn: {
        flexDirection: 'row',
        backgroundColor: '#23238E',
        marginHorizontal: wp(5),
        marginTop: verticalScale(16),
        paddingVertical: verticalScale(16),
        borderRadius: scale(16),
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(10),
        shadowColor: '#23238E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    trackBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: '700' },
    noItemsText: { fontSize: moderateScale(14), color: '#888', textAlign: 'center', marginTop: 10 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: verticalScale(12), color: '#666', fontSize: moderateScale(14) },
    errorText: { marginTop: verticalScale(12), color: '#222', fontSize: moderateScale(16), fontWeight: '600' },
    backBtnSmall: { marginTop: verticalScale(20), paddingHorizontal: scale(20), paddingVertical: verticalScale(10), backgroundColor: '#23238E', borderRadius: scale(8) },
    backBtnText: { color: '#fff', fontWeight: '600' },
});
