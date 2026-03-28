import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { pushData, createNotification } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { clearLabCart, removeFromLabCart } from '../../Utils/firebaseLabStorage';
import { showOrderPlacedNotification } from '../../Utils/localNotifications';

const paymentMethods = [
    { id: 'card', name: 'Credit / Debit Card', icon: require('../../images/Visa.png'), hasIcons: true },
    { id: 'upi', name: 'UPI', icon: require('../../images/UPI.png'), hasIcons: false },
    { id: 'netbanking', name: 'Net banking', icon: require('../../images/bank.png'), hasIcons: false },
    { id: 'clinic', name: 'Pay at Clinic', icon: null, hasIcons: false },
];

export default function LabPaymentScreen({ navigation, route }) {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);
    const [orderData, setOrderData] = useState(null);

    // Debug: Log received params
    console.log('[LabPayment] Route params:', JSON.stringify(route?.params, null, 2));

    const bookingDetails = route?.params?.bookingDetails || {
        type: 'lab',
        items: [],
        schedule: {
            date: 'Not Set',
            timeSlot: 'Not Set',
            address: 'Not Set',
        },
        summary: {
            subtotal: 0,
            collectionCharge: 0,
            discount: 0,
            tax: 0,
            total: 0,
        },
    };

    const handleApplyCoupon = () => {
        setCouponApplied(true);
    };

    const handlePay = async () => {
        const user = getCurrentUser();
        if (!user) {
            Alert.alert('Login Required', 'Please login to place an order');
            return;
        }

        try {
            console.log(`[LabPayment] Starting payment flow for user: ${user.uid}`);
            if (!bookingDetails.items || bookingDetails.items.length === 0) {
                console.warn('[LabPayment] Empty cart items found');
                Alert.alert('Empty Order', 'No items found in your booking.');
                return;
            }

            // Generate order ID
            const orderId = `LAB${Date.now().toString().slice(-7)}`;

            // Create clean order object
            const labOrder = {
                orderId: orderId,
                userId: user.uid,
                userEmail: user.email || '',
                status: 'Confirmed',
                createdAt: new Date().toISOString(),
                paymentMethod: selectedMethod || 'UPI',
                items: bookingDetails.items || [],
                schedule: bookingDetails.schedule || {},
                summary: bookingDetails.summary || {},
                location: bookingDetails.location || {},
                patient: bookingDetails.patient || {},
                total: total,
            };

            const dbPath = `labOrders/${user.uid}`;
            console.log(`[LabPayment] Attempting to save order to path: ${dbPath}`);

            // Save to labOrders (user-specific)
            const result = await pushData(dbPath, labOrder);

            if (result.success) {
                console.log(`[LabPayment] Order saved successfully with key: ${result.key}`);
                const finalOrder = { id: result.key, ...labOrder };
                setOrderData(finalOrder);

                // Centralized allOrders collection for easy lookup by orderId
                console.log('[LabPayment] Saving to global allOrders collection');
                await pushData('allOrders', {
                    ...finalOrder,
                    orderType: 'lab',
                    orderId: orderId
                });

                // Create database notification
                await createNotification(user.uid, {
                    type: 'order',
                    title: 'Lab Test Booked',
                    message: `Your lab test at Apollo Labs has been booked successfully. Order ID: ${orderId}`,
                    data: {
                        orderId: orderId,
                        orderType: 'lab'
                    }
                });

                // Show local push notification
                await showOrderPlacedNotification({
                    orderId: orderId,
                    orderType: 'lab',
                    total: total,
                    itemCount: bookingDetails.items.length,
                });

                // Clear the lab cart after successful payment
                await clearLabCart();
                setShowSuccessModal(true);
            } else {
                console.error(`[LabPayment] Failed to save order: ${result.error}`);
                Alert.alert('Save Failed', `Failed to save order: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('[LabPayment] Unexpected error in handlePay:', error);
            Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
        }
    };

    const handleTrack = () => {
        setShowSuccessModal(false);
        navigation.navigate('CollectionStatusScreen', { order: orderData });
    };

    const handleViewBill = () => {
        setShowSuccessModal(false);
        navigation.navigate('LabBillScreen', { order: orderData });
    };

    const total = couponApplied ? bookingDetails.summary.total - 100 : bookingDetails.summary.total;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Payment Methods */}
                    <Text style={styles.sectionTitle}>Select a payment method</Text>

                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioSelected]}>
                                {selectedMethod === method.id && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.methodName}>{method.name}</Text>
                            {method.icon && (
                                <Image source={method.icon} style={styles.methodIcon} />
                            )}
                            {method.id === 'card' && (
                                <Image source={require('../../images/Mastercard.png')} style={styles.methodIcon} />
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* Coupon Section */}
                    <View style={styles.couponSection}>
                        <View style={styles.couponRow}>
                            <Ionicons name="pricetag" size={moderateScale(18)} color="#23238E" />
                            <Text style={styles.couponText}>Apply Coupon</Text>
                            {!couponApplied ? (
                                <TouchableOpacity onPress={handleApplyCoupon}>
                                    <Text style={styles.applyBtn}>Apply</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.appliedBadge}>
                                    <Text style={styles.appliedText}>₹100 OFF Saved</Text>
                                    <Ionicons name="checkmark" size={moderateScale(14)} color="#4CAF50" />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Order Summary */}
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>Rs. {bookingDetails.summary.subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Collection Charge</Text>
                            <Text style={styles.summaryValue}>Rs. {bookingDetails.summary.collectionCharge}</Text>
                        </View>
                        {couponApplied && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabelGreen}>Coupon Discount</Text>
                                <Text style={styles.summaryValueGreen}>- Rs. 100</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax (GST)</Text>
                            <Text style={styles.summaryValue}>Rs. {bookingDetails.summary.tax}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>Rs. {total}</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.bottomLabel}>Total</Text>
                        <Text style={styles.bottomTotal}>Rs. {total}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.payBtn, !selectedMethod && styles.payBtnDisabled]}
                        onPress={handlePay}
                        disabled={!selectedMethod}
                    >
                        <Text style={styles.payBtnText}>Proceed</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconCircle}>
                            <Ionicons name="checkmark" size={moderateScale(42)} color="#4CAF50" />
                        </View>
                        <Text style={styles.modalTitle}>Payment Success</Text>
                        <Text style={styles.modalSubtitle}>
                            Your payment has been successful,{'\n'}you can track your order now.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.billModalBtn} onPress={handleViewBill}>
                                <Text style={styles.billModalBtnText}>Bill</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.trackModalBtn} onPress={handleTrack}>
                                <Text style={styles.trackModalBtnText}>Track</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    placeholder: { width: scale(36) },
    scrollContent: { paddingBottom: hp(18) },

    sectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: '#222',
        marginHorizontal: wp(4),
        marginTop: hp(2.5),
        marginBottom: hp(1.5),
    },

    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginBottom: hp(1.2),
        padding: wp(4),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    methodCardSelected: {
        borderColor: '#23238E',
        backgroundColor: '#F5F8FF',
    },
    radioOuter: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    radioSelected: {
        borderColor: '#23238E',
    },
    radioInner: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        backgroundColor: '#23238E',
    },
    methodName: {
        flex: 1,
        fontSize: moderateScale(14),
        color: '#222',
        fontWeight: '500',
    },
    methodIcon: {
        width: scale(28),
        height: scale(18),
        resizeMode: 'contain',
        marginLeft: scale(8),
    },

    couponSection: {
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginTop: hp(2),
        padding: wp(4),
        borderRadius: scale(12),
    },
    couponRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    couponText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#222',
        fontWeight: '500',
        marginLeft: wp(2.5),
    },
    applyBtn: {
        fontSize: moderateScale(13),
        color: '#E53935',
        fontWeight: '700',
    },
    appliedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: scale(6),
        gap: scale(4),
    },
    appliedText: {
        fontSize: moderateScale(11),
        color: '#4CAF50',
        fontWeight: '600',
    },

    summarySection: {
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginTop: hp(2),
        padding: wp(4),
        borderRadius: scale(12),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    summaryLabel: {
        fontSize: moderateScale(12),
        color: '#666',
    },
    summaryValue: {
        fontSize: moderateScale(12),
        color: '#666',
    },
    summaryLabelGreen: {
        fontSize: moderateScale(12),
        color: '#4CAF50',
    },
    summaryValueGreen: {
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

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    bottomLabel: {
        fontSize: moderateScale(11),
        color: '#888',
    },
    bottomTotal: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#222',
    },
    payBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(12),
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(10),
    },
    payBtnDisabled: {
        backgroundColor: '#CCC',
    },
    payBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: '700',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: scale(24),
        padding: wp(8),
        alignItems: 'center',
        marginHorizontal: wp(8),
        width: wp(84),
    },
    successIconCircle: {
        width: scale(75),
        height: scale(75),
        borderRadius: scale(37.5),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2.5),
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp(1),
    },
    modalSubtitle: {
        fontSize: moderateScale(13),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(20),
        marginBottom: hp(3),
    },
    modalButtons: {
        flexDirection: 'row',
        gap: scale(12),
    },
    billModalBtn: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(8),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: '#222',
    },
    billModalBtnText: {
        fontSize: moderateScale(13),
        color: '#222',
        fontWeight: '600',
    },
    trackModalBtn: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(10),
        borderRadius: scale(10),
        backgroundColor: '#23238E',
    },
    trackModalBtnText: {
        fontSize: moderateScale(13),
        color: '#fff',
        fontWeight: '600',
    },
});
