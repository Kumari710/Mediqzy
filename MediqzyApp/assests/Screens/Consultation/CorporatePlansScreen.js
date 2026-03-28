import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const corporatePlans = [
    {
        id: '1',
        name: 'Corporate Health Coverage',
        membersCount: 2,
        validTill: '25-12-2025',
        discount: '₹1500 OFF',
        isExpanded: false,
        terms: [
            'Offer is valid only on select consultations',
            'Free annual checkups',
            '24 x 7 Support',
            'Other T&Cs may apply',
        ],
    },
    {
        id: '2',
        name: 'Lab Test Coverage',
        membersCount: 2,
        validTill: '25-12-2025',
        discount: '₹500 OFF',
        isExpanded: false,
        terms: [
            'Valid on all diagnostic tests',
            'Home sample collection available',
            'Results within 24 hours',
        ],
    },
    {
        id: '3',
        name: 'Pharmacy Coverage',
        membersCount: 2,
        validTill: '25-12-2025',
        discount: '15% OFF',
        isExpanded: false,
        terms: [
            'Valid on all medicines',
            'Free home delivery',
            'Auto-refill available',
        ],
    },
    {
        id: '4',
        name: 'Emergency Care Support',
        membersCount: 2,
        validTill: '25-12-2025',
        discount: '₹2000 OFF',
        isExpanded: false,
        terms: [
            '24 x 7 emergency support',
            'Ambulance services included',
            'Priority admission',
        ],
    },
    {
        id: '5',
        name: 'Premium checkups for senior employees',
        membersCount: 1,
        validTill: '22-12-2025',
        discount: '₹3000 OFF',
        isExpanded: false,
        terms: [
            'Comprehensive health checkup',
            'Cardiac screening included',
            'Bone density test included',
        ],
    },
];

export default function CorporatePlansScreen({ navigation }) {
    const [plans, setPlans] = useState(corporatePlans);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [appliedPlan, setAppliedPlan] = useState(null);

    const toggleExpand = (planId) => {
        setPlans(plans.map(plan =>
            plan.id === planId ? { ...plan, isExpanded: !plan.isExpanded } : plan
        ));
    };

    const handleApply = (plan) => {
        setAppliedPlan(plan);
        setShowSuccessModal(true);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Corporate Plans</Text>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="notifications-outline" size={moderateScale(22)} color="#23238E" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="cart-outline" size={moderateScale(22)} color="#23238E" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Description */}
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>
                            Hospital supported health benefits for employees registered under their organization.
                        </Text>
                    </View>

                    {/* Plans List */}
                    {plans.map((plan) => (
                        <View key={plan.id} style={styles.planCard}>
                            <TouchableOpacity
                                style={styles.planHeader}
                                onPress={() => toggleExpand(plan.id)}
                            >
                                <View style={styles.planTitleRow}>
                                    <View style={styles.radioOuter}>
                                        <View style={styles.radioInner} />
                                    </View>
                                    <View style={styles.planInfo}>
                                        <Text style={styles.planName}>{plan.name}</Text>
                                        <View style={styles.planMetaRow}>
                                            <Text style={styles.planMeta}>Members Covered: {plan.membersCount}</Text>
                                        </View>
                                        <Text style={styles.planValidity}>Valid Till: {plan.validTill}</Text>
                                    </View>
                                </View>
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{plan.discount}</Text>
                                </View>
                                <Ionicons
                                    name={plan.isExpanded ? "chevron-up" : "chevron-down"}
                                    size={moderateScale(18)}
                                    color="#23238E"
                                />
                            </TouchableOpacity>

                            {plan.isExpanded && (
                                <View style={styles.planDetails}>
                                    <Text style={styles.termsTitle}>Terms and Conditions apply</Text>
                                    {plan.terms.map((term, index) => (
                                        <View key={index} style={styles.termRow}>
                                            <View style={styles.bulletPoint} />
                                            <Text style={styles.termText}>{term}</Text>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.applyBtn}
                                        onPress={() => handleApply(plan)}
                                    >
                                        <Text style={styles.applyBtnText}>Apply Now</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
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
                        <Text style={styles.appliedText}>Applied</Text>
                        <View style={styles.discountAppliedBox}>
                            <Text style={styles.discountAppliedText}>
                                {appliedPlan?.discount} on {appliedPlan?.name}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.doneBtn}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.doneBtnText}>Done</Text>
                        </TouchableOpacity>
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
        flex: 1,
        marginLeft: wp(2),
    },
    headerIcons: {
        flexDirection: 'row',
        gap: scale(8),
    },
    iconBtn: {
        width: scale(36),
        height: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: { padding: wp(4), paddingBottom: hp(4) },

    descriptionBox: {
        backgroundColor: '#E8F4FF',
        borderRadius: scale(12),
        padding: wp(4),
        marginBottom: hp(2.5),
    },
    descriptionText: {
        fontSize: moderateScale(13),
        color: '#23238E',
        lineHeight: moderateScale(20),
    },

    planCard: {
        backgroundColor: '#fff',
        borderRadius: scale(14),
        marginBottom: hp(1.5),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
    },
    planTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    radioOuter: {
        width: scale(18),
        height: scale(18),
        borderRadius: scale(9),
        borderWidth: 2,
        borderColor: '#23238E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
        marginTop: verticalScale(2),
    },
    radioInner: {
        width: scale(9),
        height: scale(9),
        borderRadius: scale(4.5),
        backgroundColor: '#23238E',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp(0.5),
    },
    planMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planMeta: {
        fontSize: moderateScale(11),
        color: '#666',
    },
    planValidity: {
        fontSize: moderateScale(11),
        color: '#23238E',
        fontWeight: '500',
        marginTop: hp(0.5),
    },
    discountBadge: {
        backgroundColor: '#23238E',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: scale(8),
        marginRight: wp(2),
    },
    discountText: {
        color: '#fff',
        fontSize: moderateScale(11),
        fontWeight: '700',
    },

    planDetails: {
        padding: wp(4),
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    termsTitle: {
        fontSize: moderateScale(13),
        fontWeight: '700',
        color: '#222',
        marginBottom: hp(1.5),
        marginTop: hp(1.5),
    },
    termRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: hp(1),
    },
    bulletPoint: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: '#23238E',
        marginTop: verticalScale(6),
        marginRight: wp(2.5),
    },
    termText: {
        fontSize: moderateScale(12),
        color: '#555',
        flex: 1,
        lineHeight: moderateScale(18),
    },
    applyBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(10),
        paddingVertical: hp(1.6),
        alignItems: 'center',
        marginTop: hp(2),
    },
    applyBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: '600',
    },

    // Modal Styles
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
        marginBottom: hp(2),
    },
    appliedText: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: hp(1.5),
    },
    discountAppliedBox: {
        backgroundColor: '#FFF3E0',
        borderRadius: scale(10),
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        marginBottom: hp(3),
    },
    discountAppliedText: {
        fontSize: moderateScale(13),
        color: '#E65100',
        fontWeight: '600',
        textAlign: 'center',
    },
    doneBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(10),
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(15),
    },
    doneBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: '600',
    },
});
