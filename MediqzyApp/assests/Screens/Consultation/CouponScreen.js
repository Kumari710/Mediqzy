import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const coupons = [
    {
        id: 1,
        code: 'MEDIQ30',
        title: '30% OFF on Online Consult',
        description: 'Get 30% discount on your first online consultation.',
        expiry: 'Valid till 30 Jan 2026',
        discountType: 'percentage',
        discountValue: 30,
    },
    {
        id: 2,
        code: 'HEALTH100',
        title: 'Flat Rs. 100 OFF',
        description: 'Valid on all hospital visits and online consultations.',
        expiry: 'Valid till 15 Feb 2026',
        discountType: 'flat',
        discountValue: 100,
    },
    {
        id: 3,
        code: 'APOLLO50',
        title: '50% OFF at Apollo',
        description: 'Exclusive discount for Apollo Hospital visits.',
        expiry: 'Valid till 28 Feb 2026',
        discountType: 'percentage',
        discountValue: 50,
    },
    {
        id: 4,
        code: 'NEWUSER',
        title: 'Rs. 200 OFF for New Users',
        description: 'First-time users get Rs. 200 OFF on any consultation.',
        expiry: 'Valid till 31 Mar 2026',
        discountType: 'flat',
        discountValue: 200,
    },
];

export default function CouponScreen({ navigation, route }) {
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const handleApplyCoupon = (coupon) => {
        setAppliedCoupon(coupon);
        Alert.alert(
            'Coupon Applied!',
            `${coupon.title} has been applied successfully.`,
            [
                {
                    text: 'Continue',
                    onPress: () => {
                        // Navigate back with the selected coupon
                        if (route?.params?.onApply) {
                            route.params.onApply(coupon);
                        }
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleManualApply = () => {
        if (!couponCode.trim()) {
            Alert.alert('Error', 'Please enter a coupon code');
            return;
        }

        const foundCoupon = coupons.find(
            (c) => c.code.toUpperCase() === couponCode.toUpperCase()
        );

        if (foundCoupon) {
            handleApplyCoupon(foundCoupon);
        } else {
            Alert.alert('Invalid Coupon', 'The coupon code you entered is not valid or has expired.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply Coupon</Text>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(4) }}>
                {/* Input Area */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Coupon Code"
                            placeholderTextColor="#999"
                            value={couponCode}
                            onChangeText={setCouponCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={handleManualApply}
                            disabled={!couponCode}
                        >
                            <Text style={[styles.applyBtnText, !couponCode && { color: '#888' }]}>APPLY</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Available Offers</Text>

                {coupons.map((coupon) => (
                    <View key={coupon.id} style={[styles.couponCard, appliedCoupon?.id === coupon.id && styles.couponCardApplied]}>
                        <View style={styles.couponMain}>
                            <View style={[styles.offerIconBox, appliedCoupon?.id === coupon.id && styles.offerIconBoxApplied]}>
                                <Ionicons name={appliedCoupon?.id === coupon.id ? "checkmark" : "pricetag"} size={moderateScale(20)} color={appliedCoupon?.id === coupon.id ? "#4CAF50" : "#23238E"} />
                            </View>
                            <View style={styles.couponInfo}>
                                <Text style={styles.couponTitle}>{coupon.title}</Text>
                                <Text style={styles.couponDesc}>{coupon.description}</Text>
                                <Text style={styles.couponExpiry}>{coupon.expiry}</Text>
                            </View>
                        </View>
                        <View style={styles.cardDivider} />
                        <View style={styles.couponAction}>
                            <View style={styles.codeBadge}>
                                <Text style={styles.codeText}>{coupon.code}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleApplyCoupon(coupon)}>
                                <Text style={[styles.applyLink, appliedCoupon?.id === coupon.id && styles.appliedLink]}>
                                    {appliedCoupon?.id === coupon.id ? 'APPLIED' : 'APPLY'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: hp(5),
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
    inputSection: {
        backgroundColor: '#fff',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        height: verticalScale(48),
        fontSize: moderateScale(14),
        color: '#222',
        fontWeight: '600',
    },
    applyBtn: {
        paddingHorizontal: scale(12),
    },
    applyBtnText: {
        color: '#23238E',
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#222',
        marginHorizontal: wp(4),
        marginTop: verticalScale(24),
        marginBottom: verticalScale(16),
    },
    couponCard: {
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginBottom: verticalScale(16),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    couponMain: {
        flexDirection: 'row',
        padding: scale(16),
    },
    offerIconBox: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    couponInfo: {
        flex: 1,
    },
    couponTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#222',
    },
    couponDesc: {
        fontSize: moderateScale(12),
        color: '#666',
        marginTop: verticalScale(4),
        lineHeight: moderateScale(18),
    },
    couponExpiry: {
        fontSize: moderateScale(11),
        color: '#888',
        marginTop: verticalScale(8),
        fontWeight: '500',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: scale(16),
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    couponAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#FCFDFF',
    },
    codeBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
        borderWidth: 1,
        borderColor: '#DDD',
        borderStyle: 'dashed',
    },
    codeText: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
        color: '#222',
        letterSpacing: 1,
    },
    applyLink: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#E53935',
    },
    appliedLink: {
        color: '#4CAF50',
    },
    couponCardApplied: {
        borderColor: '#4CAF50',
        backgroundColor: '#F8FFF8',
    },
    offerIconBoxApplied: {
        backgroundColor: '#E8F5E9',
    },
});
