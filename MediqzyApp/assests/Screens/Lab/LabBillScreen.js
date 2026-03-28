import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getOrderById, saveBill, getBillByOrderId } from '../../Utils/firebaseDatabase';

export default function LabBillScreen({ navigation, route }) {
    const { orderId, order: initialOrder } = route.params || {};
    const [order, setOrder] = useState(initialOrder || {});
    const [loading, setLoading] = useState(!initialOrder && !!orderId);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (orderId && !initialOrder) {
            fetchOrder(orderId);
        }
    }, [orderId]);

    const fetchOrder = async (oid) => {
        setLoading(true);
        const result = await getOrderById(oid);
        if (result.success) {
            setOrder(result.data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
                <ActivityIndicator size="large" color="#23238E" />
                <Text style={{ marginTop: 10, color: '#666' }}>Fetching lab bill...</Text>
            </View>
        );
    }

    // Normalize data from order object
    const billData = {
        testName: order.items?.[0]?.name || 'Lab Test',
        labName: order.provider?.name || order.labName || 'Apollo Labs',
        labAddress: order.provider?.address || order.labAddress || 'T.nagar, Chennai 600017',
        patientName: order.patientName || order.patient?.name || order.patient || 'Shivakumar',
        testDate: order.testDate || order.schedule?.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')),
        collectionTime: order.schedule?.timeSlot || order.timeSlot || '08:00 AM - 10:00 AM',
        orderNo: order.orderId || orderId || 'LAB9755472',
        items: order.items || [
            { name: 'Full Body Health Checkup', price: order.summary?.total || 0 },
        ],
        subtotal: order.summary?.subtotal || (parseFloat(order.total || 0) * 0.9),
        collectionCharge: order.summary?.collectionCharge || 50,
        discount: order.summary?.discount || 0,
        tax: order.summary?.tax || order.summary?.taxes || 0,
        total: order.summary?.total || order.total || 0,
        paymentMethod: order.paymentMethod || 'UPI',
        paymentStatus: 'Paid',
    };

    const handleDownload = async () => {
        setSaving(true);
        // Persist bill to backend
        const result = await saveBill(billData.orderNo, billData);
        setSaving(false);

        if (result.success) {
            Alert.alert(
                "Bill Downloaded",
                "Your invoice has been generated and securely saved. You can always access this bill from your Order History.",
                [{ text: "Great!" }]
            );
        } else {
            Alert.alert("Error", "Could not save bill metadata. Please try again.");
        }
    };


    const handleShare = () => {
        // Share bill logic
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lab Test Bill</Text>
                    <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                        <Ionicons name="share-social-outline" size={moderateScale(22)} color="#23238E" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Lab Info Card */}
                    <View style={styles.labCard}>
                        <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
                        <View style={styles.labInfo}>
                            <Text style={styles.labName}>{billData.labName}</Text>
                            <Text style={styles.labAddress}>{billData.labAddress}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{billData.paymentStatus}</Text>
                        </View>
                    </View>

                    {/* Order Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order No.</Text>
                            <Text style={styles.detailValue}>{billData.orderNo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Patient Name</Text>
                            <Text style={styles.detailValue}>{billData.patientName}</Text>
                        </View>
                        {(order.patientPhone || order.patient?.phone || order.patient?.phoneNumber || order.mobileNumber) && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Phone Number</Text>
                                <Text style={styles.detailValue}>{order.patientPhone || order.patient?.phone || order.patient?.phoneNumber || order.mobileNumber}</Text>
                            </View>
                        )}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Test Date</Text>
                            <Text style={styles.detailValue}>{billData.testDate}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Collection Time</Text>
                            <Text style={styles.detailValue}>{billData.collectionTime}</Text>
                        </View>
                    </View>

                    {/* Test Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tests Ordered</Text>
                        {billData.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemIconBox}>
                                    <Ionicons name="flask-outline" size={moderateScale(18)} color="#23238E" />
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Payment Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Breakdown</Text>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Subtotal</Text>
                            <Text style={styles.breakdownValue}>Rs. {billData.subtotal}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Collection Charge</Text>
                            <Text style={styles.breakdownValue}>Rs. {billData.collectionCharge}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabelGreen}>Discount</Text>
                            <Text style={styles.breakdownValueGreen}>- Rs. {billData.discount}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Tax (GST)</Text>
                            <Text style={styles.breakdownValue}>Rs. {billData.tax}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.breakdownRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>Rs. {billData.total}</Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentMethodCard}>
                            <View style={styles.paymentIconBox}>
                                <Image source={require('../../images/UPI.png')} style={styles.paymentIcon} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentMethodName}>{billData.paymentMethod}</Text>
                                <Text style={styles.paymentMethodStatus}>Payment Successful</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={moderateScale(22)} color="#4CAF50" />
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Buttons */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.downloadBtn, saving && { opacity: 0.7 }]}
                        onPress={handleDownload}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={moderateScale(18)} color="#fff" />
                                <Text style={styles.downloadBtnText}>Download Bill</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    backBtn: {
        width: scale(36),
        height: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(17),
        fontWeight: '700',
        color: '#222',
    },
    shareBtn: {
        width: scale(36),
        height: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: { paddingBottom: hp(15) },

    labCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginTop: hp(2),
        padding: wp(4),
        borderRadius: scale(14),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    labLogo: {
        width: scale(45),
        height: scale(45),
        borderRadius: scale(10),
        marginRight: wp(3),
    },
    labInfo: {
        flex: 1,
    },
    labName: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: '#222',
    },
    labAddress: {
        fontSize: moderateScale(12),
        color: '#888',
        marginTop: hp(0.5),
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        borderRadius: scale(8),
    },
    statusText: {
        fontSize: moderateScale(11),
        fontWeight: '700',
        color: '#4CAF50',
    },

    section: {
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginTop: hp(2),
        padding: wp(4),
        borderRadius: scale(14),
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp(1.5),
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    detailLabel: {
        fontSize: moderateScale(12),
        color: '#888',
    },
    detailValue: {
        fontSize: moderateScale(12),
        color: '#222',
        fontWeight: '500',
    },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemIconBox: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(10),
        backgroundColor: '#E8F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    itemName: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#222',
        fontWeight: '500',
    },
    itemPrice: {
        fontSize: moderateScale(13),
        color: '#23238E',
        fontWeight: '600',
    },

    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    breakdownLabel: {
        fontSize: moderateScale(12),
        color: '#666',
    },
    breakdownValue: {
        fontSize: moderateScale(12),
        color: '#666',
    },
    breakdownLabelGreen: {
        fontSize: moderateScale(12),
        color: '#4CAF50',
    },
    breakdownValueGreen: {
        fontSize: moderateScale(12),
        color: '#4CAF50',
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: hp(1.5),
    },
    totalLabel: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: '#222',
    },
    totalValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#23238E',
    },

    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: wp(3),
        borderRadius: scale(12),
    },
    paymentIconBox: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    paymentIcon: {
        width: scale(24),
        height: scale(24),
        resizeMode: 'contain',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentMethodName: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#222',
    },
    paymentMethodStatus: {
        fontSize: moderateScale(11),
        color: '#4CAF50',
        marginTop: hp(0.3),
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#23238E',
        borderRadius: scale(12),
        paddingVertical: hp(2),
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(8),
    },
    downloadBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: '700',
    },
});
