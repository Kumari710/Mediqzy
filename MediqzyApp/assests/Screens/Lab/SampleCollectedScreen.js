import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { updateData } from '../../Utils/firebaseDatabase';
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
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    primaryLight: '#E0E7FF',
};

export default function SampleCollectedScreen({ navigation, route }) {
    const { order, orderId } = route.params || {};
    const [scaleAnim] = useState(new Animated.Value(0));
    const [fadeAnim] = useState(new Animated.Value(0));
    const [estimatedTime, setEstimatedTime] = useState('24-48 hours');

    useEffect(() => {
        // Animate success icon
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Update order status in Firebase
        updateOrderToCollected();
    }, []);

    const updateOrderToCollected = async () => {
        try {
            const user = getCurrentUser();
            const id = order?.id || orderId;
            if (user && id) {
                await updateData(`labOrders/${user.uid}/${id}`, {
                    status: 'collected',
                    collectionStatus: 'collected',
                    sampleCollectedAt: Date.now(),
                    estimatedReportTime: estimatedTime,
                    updatedAt: Date.now(),
                });
            }
        } catch (error) {
            console.warn('Error updating order status:', error.message);
        }
    };

    const handleTrackReport = () => {
        navigation.navigate('LabTestDetailsScreen', { order, orderId: order?.id || orderId });
    };

    const handleViewOrders = () => {
        navigation.navigate('OrdersScreen');
    };

    const handleGoHome = () => {
        navigation.navigate('HomeScreen');
    };

    // Normalize order data
    const testName = order?.items?.[0]?.name || order?.tests?.[0]?.name || 'Lab Test';
    const labName = order?.provider?.name || order?.labName || 'Apollo Diagnostics';
    const orderIdDisplay = order?.orderId || order?.id?.slice(-8).toUpperCase() || 'LAB-XXXXX';
    const patientName = order?.patientName || order?.patient?.name || 'Patient';
    const testDate = order?.schedule?.date || order?.testDate || new Date().toLocaleDateString('en-GB');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Success Animation */}
                    <Animated.View
                        style={[
                            styles.successContainer,
                            { transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <View style={styles.successIconOuter}>
                            <View style={styles.successIconMiddle}>
                                <View style={styles.successIconInner}>
                                    <Ionicons name="checkmark" size={50} color={COLORS.success} />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Success Message */}
                    <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.successTitle}>Sample Collected!</Text>
                        <Text style={styles.successSubtitle}>
                            Your sample has been successfully collected and is on its way to the laboratory for testing.
                        </Text>
                    </Animated.View>

                    {/* Order Summary Card */}
                    <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
                        <View style={styles.orderHeader}>
                            <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.labName}>{labName}</Text>
                                <Text style={styles.orderId}>Order ID: {orderIdDisplay}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Ionicons name="flask" size={12} color={COLORS.success} />
                                <Text style={styles.statusText}>Collected</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderDetails}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailIconBox}>
                                    <Ionicons name="flask-outline" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Test Name</Text>
                                    <Text style={styles.detailValue}>{testName}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailIconBox}>
                                    <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Patient</Text>
                                    <Text style={styles.detailValue}>{patientName}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailIconBox}>
                                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Collection Date</Text>
                                    <Text style={styles.detailValue}>{testDate}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Estimated Time Card */}
                    <Animated.View style={[styles.estimateCard, { opacity: fadeAnim }]}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            style={styles.estimateGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.estimateIconBox}>
                                <Ionicons name="time-outline" size={28} color={COLORS.white} />
                            </View>
                            <View style={styles.estimateContent}>
                                <Text style={styles.estimateLabel}>Estimated Report Time</Text>
                                <Text style={styles.estimateValue}>{estimatedTime}</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Next Steps */}
                    <Animated.View style={[styles.stepsCard, { opacity: fadeAnim }]}>
                        <Text style={styles.stepsTitle}>What's Next?</Text>

                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Sample Analysis</Text>
                                <Text style={styles.stepDesc}>
                                    Your sample is being processed at the laboratory
                                </Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Report Generation</Text>
                                <Text style={styles.stepDesc}>
                                    Once analysis is complete, your report will be generated
                                </Text>
                            </View>
                        </View>

                        <View style={styles.stepItem}>
                            <View style={[styles.stepNumber, styles.stepNumberLast]}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Get Notified</Text>
                                <Text style={styles.stepDesc}>
                                    You'll receive a notification when your report is ready
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Info Note */}
                    <Animated.View style={[styles.infoNote, { opacity: fadeAnim }]}>
                        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            You can track your report status anytime from the Orders section
                        </Text>
                    </Animated.View>

                    <View style={{ height: hp(18) }} />
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackReport}>
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="analytics-outline" size={20} color={COLORS.white} />
                            <Text style={styles.primaryBtnText}>Track Report Status</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.secondaryActions}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleViewOrders}>
                            <Text style={styles.secondaryBtnText}>View Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
                            <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    safeArea: { flex: 1 },
    scrollContent: {
        paddingHorizontal: wp(6),
        paddingTop: hp(4),
        alignItems: 'center',
    },
    successContainer: { marginBottom: hp(3) },
    successIconOuter: {
        width: scale(140),
        height: scale(140),
        borderRadius: scale(70),
        backgroundColor: COLORS.successLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconMiddle: {
        width: scale(110),
        height: scale(110),
        borderRadius: scale(55),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconInner: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    messageContainer: { alignItems: 'center', marginBottom: hp(3) },
    successTitle: {
        fontSize: moderateScale(26),
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: verticalScale(10),
    },
    successSubtitle: {
        fontSize: moderateScale(14),
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: moderateScale(22),
        paddingHorizontal: wp(5),
    },
    orderCard: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: hp(2),
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center' },
    labLogo: { width: scale(48), height: scale(48), borderRadius: moderateScale(12) },
    orderInfo: { flex: 1, marginLeft: scale(12) },
    labName: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text },
    orderId: { fontSize: moderateScale(12), color: COLORS.textSecondary, marginTop: verticalScale(2) },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successLight,
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(8),
        gap: scale(4),
    },
    statusText: { fontSize: moderateScale(11), fontWeight: '700', color: COLORS.success },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: verticalScale(16) },
    orderDetails: { gap: verticalScale(14) },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailIconBox: {
        width: scale(36),
        height: scale(36),
        borderRadius: moderateScale(10),
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: moderateScale(11), color: COLORS.textSecondary },
    detailValue: { fontSize: moderateScale(14), color: COLORS.text, fontWeight: '600', marginTop: verticalScale(2) },
    estimateCard: { width: '100%', borderRadius: moderateScale(20), overflow: 'hidden', marginBottom: hp(2) },
    estimateGradient: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(20) },
    estimateIconBox: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(15),
    },
    estimateContent: { flex: 1 },
    estimateLabel: { fontSize: moderateScale(12), color: 'rgba(255,255,255,0.8)' },
    estimateValue: { fontSize: moderateScale(20), fontWeight: '800', color: COLORS.white, marginTop: verticalScale(2) },
    stepsCard: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: moderateScale(20),
        padding: moderateScale(20),
        marginBottom: hp(2),
    },
    stepsTitle: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(18) },
    stepItem: { flexDirection: 'row', marginBottom: verticalScale(16) },
    stepNumber: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(14),
    },
    stepNumberLast: { backgroundColor: COLORS.textSecondary },
    stepNumberText: { fontSize: moderateScale(12), fontWeight: '700', color: COLORS.white },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: moderateScale(14), fontWeight: '600', color: COLORS.text },
    stepDesc: { fontSize: moderateScale(12), color: COLORS.textSecondary, marginTop: verticalScale(2), lineHeight: moderateScale(18) },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        padding: moderateScale(16),
        borderRadius: moderateScale(14),
        width: '100%',
        gap: scale(10),
    },
    infoText: { flex: 1, fontSize: moderateScale(13), color: COLORS.primary, fontWeight: '500' },
    bottomBar: {
        backgroundColor: COLORS.white,
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    primaryBtn: { borderRadius: moderateScale(16), overflow: 'hidden', marginBottom: verticalScale(12) },
    btnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(16),
        gap: scale(10),
    },
    primaryBtnText: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '700' },
    secondaryActions: { flexDirection: 'row', gap: scale(12) },
    secondaryBtn: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(14),
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { color: COLORS.text, fontSize: moderateScale(14), fontWeight: '600' },
    homeBtn: {
        width: scale(52),
        height: scale(52),
        borderRadius: moderateScale(14),
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
