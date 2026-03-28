import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function LabOrderConfirmScreen({ navigation, route }) {
    const orderData = route?.params?.order || {
        orderId: 'LAB9755472',
        labName: 'Apollo Labs',
        testDate: '15 Jan 2024',
        timeSlot: '08:00 AM - 10:00 AM',
        address: '123, 4th Cross Street, T. Nagar, Chennai - 600017',
    };

    const handleTrackOrder = () => {
        navigation.navigate('LabTestDetailsScreen');
    };

    const handleViewBill = () => {
        navigation.navigate('LabBillScreen');
    };

    const handleGoHome = () => {
        navigation.navigate('HomeScreen');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Success Icon */}
                    <View style={styles.successIconContainer}>
                        <View style={styles.successIconOuter}>
                            <View style={styles.successIconInner}>
                                <Ionicons name="checkmark" size={moderateScale(50)} color="#4CAF50" />
                            </View>
                        </View>
                    </View>

                    {/* Success Message */}
                    <Text style={styles.successTitle}>Order Confirmed!</Text>
                    <Text style={styles.successSubtitle}>
                        Your lab test has been booked successfully.{'\n'}
                        A nurse will arrive at your location for sample collection.
                    </Text>

                    {/* Order Details Card */}
                    <View style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.labName}>{orderData.labName}</Text>
                                <Text style={styles.orderId}>Order ID: {orderData.orderId}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={moderateScale(16)} color="#23238E" />
                                <View style={styles.detailInfo}>
                                    <Text style={styles.detailLabel}>Collection Date</Text>
                                    <Text style={styles.detailValue}>{orderData.testDate}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={moderateScale(16)} color="#23238E" />
                                <View style={styles.detailInfo}>
                                    <Text style={styles.detailLabel}>Time Slot</Text>
                                    <Text style={styles.detailValue}>{orderData.timeSlot}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={moderateScale(16)} color="#23238E" />
                                <View style={styles.detailInfo}>
                                    <Text style={styles.detailLabel}>Collection Address</Text>
                                    <Text style={styles.detailValue}>{orderData.address}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Info Note */}
                    <View style={styles.infoNote}>
                        <Ionicons name="information-circle" size={moderateScale(18)} color="#23238E" />
                        <Text style={styles.infoText}>
                            You will receive a notification before the nurse arrives.
                        </Text>
                    </View>
                </View>

                {/* Bottom Buttons */}
                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={styles.trackBtn} onPress={handleTrackOrder}>
                        <Ionicons name="navigate-outline" size={moderateScale(18)} color="#fff" />
                        <Text style={styles.trackBtnText}>Track Order</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.billBtn} onPress={handleViewBill}>
                            <Text style={styles.billBtnText}>View Bill</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
                            <Text style={styles.homeBtnText}>Go Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    safeArea: { flex: 1 },
    content: {
        flex: 1,
        paddingHorizontal: wp(6),
        paddingTop: hp(5),
        alignItems: 'center',
    },

    successIconContainer: {
        marginBottom: hp(3),
    },
    successIconOuter: {
        width: scale(110),
        height: scale(110),
        borderRadius: scale(55),
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIconInner: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },

    successTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp(1.5),
    },
    successSubtitle: {
        fontSize: moderateScale(13),
        color: '#666',
        textAlign: 'center',
        lineHeight: moderateScale(20),
        marginBottom: hp(4),
    },

    orderCard: {
        backgroundColor: '#fff',
        borderRadius: scale(18),
        padding: wp(5),
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labLogo: {
        width: scale(45),
        height: scale(45),
        borderRadius: scale(12),
        marginRight: wp(3),
    },
    orderInfo: {
        flex: 1,
    },
    labName: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#222',
    },
    orderId: {
        fontSize: moderateScale(12),
        color: '#888',
        marginTop: hp(0.5),
    },
    divider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: hp(2),
    },
    orderDetails: {
        gap: hp(2),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailInfo: {
        marginLeft: wp(3),
        flex: 1,
    },
    detailLabel: {
        fontSize: moderateScale(11),
        color: '#888',
    },
    detailValue: {
        fontSize: moderateScale(13),
        color: '#222',
        fontWeight: '500',
        marginTop: hp(0.3),
    },

    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F4FF',
        padding: wp(4),
        borderRadius: scale(12),
        marginTop: hp(3),
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(12),
        color: '#23238E',
        marginLeft: wp(2.5),
    },

    bottomButtons: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(4),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    trackBtn: {
        flexDirection: 'row',
        backgroundColor: '#23238E',
        borderRadius: scale(12),
        paddingVertical: hp(2),
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(8),
        marginBottom: hp(1.5),
    },
    trackBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: '700',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: scale(12),
    },
    billBtn: {
        flex: 1,
        paddingVertical: hp(1.6),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#23238E',
        alignItems: 'center',
    },
    billBtnText: {
        color: '#23238E',
        fontSize: moderateScale(13),
        fontWeight: '600',
    },
    homeBtn: {
        flex: 1,
        paddingVertical: hp(1.6),
        borderRadius: scale(12),
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    homeBtnText: {
        color: '#222',
        fontSize: moderateScale(13),
        fontWeight: '600',
    },
});
