import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    FlatList,
    ProgressBarAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#23238E',
    secondary: '#FFB800',
    success: '#10B981',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    cardBlue: '#EEF4FF',
    cardGreen: '#ECFDF5',
};

const MyPlansScreen = ({ navigation }) => {
    const plans = [
        {
            id: '1',
            name: 'Basic Plan',
            duration: '360 days',
            status: 'Active',
            price: '₹0',
            description: 'Basic healthcare access',
            features: ['Prescriptions', 'Health Records', 'Teleconsults: Unlimited specialties covered'],
            subscribed: true,
            tier: 'Basic',
        },
        {
            id: '2',
            name: 'Basic Test Plan',
            duration: '360 days',
            status: 'Active',
            price: '₹0',
            description: 'Test membership plan for development',
            features: ['profile_access', 'appointments', 'health_records', 'Teleconsults: Unlimited specialties covered'],
            subscribed: true,
            tier: 'Basic',
        },
        {
            id: '3',
            name: 'Free Trial',
            duration: '30 days',
            status: 'Active',
            price: '₹0',
            description: '30-day free trial with basic features',
            features: ['Basic consultations', 'Health records', 'Appointment booking', 'Teleconsults: 5 consultations included'],
            subscribed: true,
            tier: 'Basic',
        },
        {
            id: '4',
            name: 'Corporate Equitas 2026',
            duration: '360 days',
            status: 'Active',
            price: '₹5,000',
            description: 'Comprehensive annual health checkup package for Equitas Bank employees - fully sponsored',
            features: [
                'Complete Blood Count (CBC)',
                'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)',
                'Liver Function Test (SGOT, SGPT, Bilirubin)',
                'Teleconsults: Unlimited specialties covered'
            ],
            subscribed: true,
            tier: 'Premium',
        },
    ];

    const UsageItem = ({ label, remaining, color }) => (
        <View style={styles.usageItem}>
            <View style={styles.usageLabelRow}>
                <Text style={styles.usageLabel}>{label}</Text>
                <Text style={styles.usageValue}>{remaining} remaining</Text>
            </View>
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '0%', backgroundColor: color }]} />
            </View>
        </View>
    );

    const PlanCard = ({ plan, upgradeMode = false }) => (
        <View style={[styles.planCard, plan.tier === 'Premium' && styles.premiumCard]}>
            <View style={styles.planHeader}>
                <View>
                    <Text style={[styles.planName, plan.tier === 'Premium' && { color: COLORS.white }]}>{plan.name}</Text>
                    <Text style={[styles.planDuration, plan.tier === 'Premium' && { color: 'rgba(255,255,255,0.8)' }]}>{plan.duration}</Text>
                </View>
                <View style={[styles.activeBadge, plan.tier === 'Premium' && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.activeBadgeText, plan.tier === 'Premium' && { color: COLORS.white }]}>{plan.status}</Text>
                </View>
            </View>

            <Text style={[styles.planPrice, plan.tier === 'Premium' && { color: COLORS.white }]}>{plan.price}</Text>
            <Text style={[styles.planDesc, plan.tier === 'Premium' && { color: 'rgba(255,255,255,0.9)' }]}>{plan.description}</Text>

            <View style={styles.divider} />

            <Text style={[styles.featureTitle, plan.tier === 'Premium' && { color: COLORS.white }]}>Features:</Text>
            {plan.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.tier === 'Premium' ? COLORS.white : COLORS.success} />
                    <Text style={[styles.featureText, plan.tier === 'Premium' && { color: COLORS.white }]}>{f}</Text>
                </View>
            ))}

            {upgradeMode ? (
                <View style={styles.upgradeInfo}>
                    <Text style={styles.upgradeDetail}>Original: {plan.price}</Text>
                    <Text style={styles.upgradeDetail}>Prorated credit: -₹0</Text>
                    <Text style={styles.payText}>Pay: {plan.price}</Text>
                    <TouchableOpacity style={styles.switchBtn}>
                        <Text style={styles.switchBtnText}>Switch Plan</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.subscribedBtn} disabled>
                    <Text style={styles.subscribedBtnText}>Already Subscribed</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Plans</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.introText}>Subscribe to a plan and track your remaining benefits</Text>

                {/* Tracking Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="pulse" size={20} color={COLORS.primary} />
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionTitle}>Live Usage Tracking</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.statusActive}>Active</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Your plan usage is monitored automatically after each consultation</Text>
                        </View>
                    </View>
                </View>

                {/* Active Membership */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="card" size={20} color={COLORS.success} />
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionTitle}>Active Membership</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.statusActive}>Active</Text>
                            </View>
                            <Text style={styles.validityText}>Valid from 24/12/2025 to 24/12/2026</Text>
                        </View>
                    </View>

                    <View style={styles.usageList}>
                        <UsageItem label="Pharmacy" remaining="₹0" color="#3B82F6" />
                        <UsageItem label="Home Care" remaining="₹0" color="#10B981" />
                        <UsageItem label="Ambulance" remaining="₹0" color="#EF4444" />
                        <UsageItem label="Teleconsults" remaining="Health Check Package: —" color="#F59E0B" />
                    </View>
                </View>

                {/* Available Plans */}
                <Text style={styles.subLabel}>Available Plans</Text>
                {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}

                {/* Upgrade Section */}
                <View style={styles.upgradeHeaderSection}>
                    <Text style={styles.upgradeTitle}>Upgrade Your Plan</Text>
                    <Text style={styles.upgradeSubtitle}>Upgrade to a higher tier and get prorated credit for your remaining days</Text>
                </View>

                <PlanCard plan={plans[0]} upgradeMode />
                <PlanCard plan={plans[2]} upgradeMode />

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        padding: wp(4),
    },
    introText: {
        fontSize: moderateScale(14),
        color: COLORS.textSecondary,
        marginBottom: hp(2),
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionHeader: {
        flexDirection: 'row',
    },
    sectionHeaderText: {
        flex: 1,
        marginLeft: 12,
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    sectionSubtitle: {
        fontSize: moderateScale(12),
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusActive: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success,
    },
    validityText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    usageList: {
        marginTop: 15,
    },
    usageItem: {
        marginBottom: 12,
    },
    usageLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    usageLabel: {
        fontSize: 13,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    usageValue: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    subLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 10,
        marginBottom: 15,
    },
    planCard: {
        backgroundColor: COLORS.white,
        borderRadius: scale(20),
        padding: scale(20),
        marginBottom: hp(2.5),
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    premiumCard: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    planName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    planDuration: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.success,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
        marginVertical: 12,
    },
    planDesc: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 15,
        opacity: 0.5,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    featureText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: 10,
    },
    subscribedBtn: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    subscribedBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    upgradeHeaderSection: {
        marginTop: 20,
        marginBottom: 15,
    },
    upgradeTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    upgradeSubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    upgradeInfo: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    upgradeDetail: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    payText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
        marginTop: 8,
        marginBottom: 15,
    },
    switchBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    switchBtnText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});

export default MyPlansScreen;
