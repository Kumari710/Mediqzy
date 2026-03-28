import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

// Theme colors for Smart Checkup (Blue theme)
const THEME = {
    primary: '#1E3A8A',
    primaryLight: '#EEF2FF',
    accent: '#27AE60',
    accentLight: '#E8F5E9',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const SmartCheckupScreen = ({ navigation }) => {
    const [checkupStarted, setCheckupStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const stepAnims = useRef(new Array(5).fill(0).map(() => new Animated.Value(0))).current;
    const benefitAnims = useRef(new Array(4).fill(0).map(() => new Animated.Value(0))).current;
    const recentAnims = useRef(new Array(3).fill(0).map(() => new Animated.Value(0))).current;

    // Checkup steps
    const checkupSteps = [
        { id: 1, name: 'Heart Rate', icon: 'heart', duration: '30 sec', color: '#E91E63' },
        { id: 2, name: 'Blood Pressure', icon: 'pulse', duration: '45 sec', color: '#3498DB' },
        { id: 3, name: 'SpO₂', icon: 'water', duration: '30 sec', color: '#9B59B6' },
        { id: 4, name: 'Stress Level', icon: 'fitness', duration: '20 sec', color: '#F97316' },
        { id: 5, name: 'HRV', icon: 'analytics', duration: '40 sec', color: '#1ABC9C' },
    ];

    // Recent checkups
    const recentCheckups = [
        { date: 'Jan 7, 2026', time: '8:30 AM', score: 88, status: 'Good', color: '#27AE60' },
        { date: 'Jan 5, 2026', time: '9:00 AM', score: 82, status: 'Good', color: '#27AE60' },
        { date: 'Jan 3, 2026', time: '8:45 AM', score: 85, status: 'Good', color: '#27AE60' },
    ];

    // Benefits
    const benefits = [
        { text: 'Quick 3-minute comprehensive health check', icon: 'time' },
        { text: 'Measures 5 vital health parameters', icon: 'pulse' },
        { text: 'AI-powered health insights', icon: 'bulb' },
        { text: 'Track trends over time', icon: 'trending-up' },
    ];

    useEffect(() => {
        startAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation
        startPulseAnimation();

        // Step animations with stagger
        stepAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 300 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });

        // Benefit animations with stagger
        benefitAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 700 + index * 60,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });

        // Recent animations with stagger
        recentAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 1000 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const startCheckup = () => {
        setCheckupStarted(true);
        setCurrentStep(0);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color={THEME.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Smart Checkup</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="time-outline" size={moderateScale(22)} color={THEME.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Hero Section */}
                    <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.heroGradient}>
                            <Animated.View style={[styles.heroIcon, { transform: [{ scale: pulseAnim }] }]}>
                                <Ionicons name="medical" size={scale(50)} color="#FFFFFF" />
                            </Animated.View>
                            <Text style={styles.heroTitle}>Complete Health Checkup</Text>
                            <Text style={styles.heroSubtitle}>
                                Get a comprehensive health assessment in just 3 minutes
                            </Text>
                            <View style={styles.heroBadges}>
                                <View style={styles.heroBadge}>
                                    <Ionicons name="time" size={scale(14)} color="#FFFFFF" />
                                    <Text style={styles.heroBadgeText}>3 min</Text>
                                </View>
                                <View style={styles.heroBadge}>
                                    <Ionicons name="pulse" size={scale(14)} color="#FFFFFF" />
                                    <Text style={styles.heroBadgeText}>5 vitals</Text>
                                </View>
                                <View style={styles.heroBadge}>
                                    <Ionicons name="analytics" size={scale(14)} color="#FFFFFF" />
                                    <Text style={styles.heroBadgeText}>AI insights</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Start Button */}
                    <TouchableOpacity style={styles.startButton} onPress={startCheckup} activeOpacity={0.8}>
                        <View style={styles.startButtonContent}>
                            <Ionicons name="play-circle" size={scale(28)} color="#FFFFFF" />
                            <Text style={styles.startButtonText}>Start Checkup</Text>
                        </View>
                        <View style={styles.startButtonArrow}>
                            <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    {/* What's Included */}
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    <View style={styles.stepsContainer}>
                        {checkupSteps.map((step, index) => {
                            const animStyle = {
                                opacity: stepAnims[index],
                                transform: [{
                                    translateX: stepAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-50, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={step.id} style={animStyle}>
                                    <View style={styles.stepCard}>
                                        <View style={[styles.stepIcon, { backgroundColor: `${step.color}15` }]}>
                                            <Ionicons name={step.icon} size={scale(24)} color={step.color} />
                                        </View>
                                        <View style={styles.stepInfo}>
                                            <Text style={styles.stepName}>{step.name}</Text>
                                            <Text style={styles.stepDuration}>
                                                <Ionicons name="time-outline" size={scale(12)} color={THEME.textSecondary} />
                                                {' '}{step.duration}
                                            </Text>
                                        </View>
                                        <View style={[styles.stepNumber, { backgroundColor: `${step.color}15` }]}>
                                            <Text style={[styles.stepNumberText, { color: step.color }]}>{index + 1}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Benefits */}
                    <Text style={styles.sectionTitle}>Benefits</Text>
                    <View style={styles.benefitsCard}>
                        {benefits.map((benefit, index) => {
                            const animStyle = {
                                opacity: benefitAnims[index],
                                transform: [{
                                    translateY: benefitAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={index} style={[styles.benefitItem, animStyle]}>
                                    <View style={[styles.benefitIcon, { backgroundColor: THEME.accentLight }]}>
                                        <Ionicons name={benefit.icon} size={scale(18)} color={THEME.accent} />
                                    </View>
                                    <Text style={styles.benefitText}>{benefit.text}</Text>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Recent Checkups */}
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Recent Checkups</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('CheckupHistoryScreen')}>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.recentList}>
                        {recentCheckups.map((checkup, index) => {
                            const animStyle = {
                                opacity: recentAnims[index],
                                transform: [{
                                    translateY: recentAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={index} style={animStyle}>
                                    <TouchableOpacity style={styles.recentCard} activeOpacity={0.7}>
                                        <View style={styles.recentLeft}>
                                            <View style={styles.recentIcon}>
                                                <Ionicons name="document-text" size={scale(22)} color={THEME.primary} />
                                            </View>
                                            <View style={styles.recentInfo}>
                                                <Text style={styles.recentDate}>{checkup.date}</Text>
                                                <Text style={styles.recentTime}>{checkup.time}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.recentRight}>
                                            <View style={[styles.scoreCircle, { backgroundColor: `${checkup.color}15` }]}>
                                                <Text style={[styles.scoreValue, { color: checkup.color }]}>{checkup.score}</Text>
                                            </View>
                                            <Text style={[styles.scoreStatus, { color: checkup.color }]}>{checkup.status}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={scale(20)} color="#CBD5E1" />
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Tips */}
                    <View style={styles.tipsCard}>
                        <View style={styles.tipsHeader}>
                            <View style={styles.tipsIcon}>
                                <Ionicons name="bulb" size={scale(22)} color="#F59E0B" />
                            </View>
                            <Text style={styles.tipsTitle}>Tips for Best Results</Text>
                        </View>
                        <View style={styles.tipsList}>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Sit comfortably and stay relaxed</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Avoid caffeine 30 minutes before</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Keep your finger steady on the sensor</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>Take the checkup at the same time daily</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default SmartCheckupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.surface,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: THEME.background,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: scale(8),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.primary,
    },
    menuButton: {
        padding: scale(8),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    heroSection: {
        marginHorizontal: wp(5),
        marginTop: hp(2),
    },
    heroGradient: {
        backgroundColor: THEME.primary,
        borderRadius: scale(24),
        padding: scale(28),
        alignItems: 'center',
    },
    heroIcon: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(45),
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(16),
    },
    heroTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: moderateScale(14),
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: verticalScale(8),
        lineHeight: moderateScale(20),
    },
    heroBadges: {
        flexDirection: 'row',
        marginTop: verticalScale(20),
        gap: scale(12),
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(20),
        gap: scale(4),
    },
    heroBadgeText: {
        fontSize: moderateScale(12),
        color: '#FFFFFF',
        fontWeight: '600',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME.accent,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        paddingVertical: hp(2),
        paddingHorizontal: scale(24),
        borderRadius: scale(16),
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    startButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(18),
        fontWeight: '700',
    },
    startButtonArrow: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        paddingHorizontal: wp(5),
        marginTop: hp(3),
        marginBottom: hp(1.5),
    },
    stepsContainer: {
        paddingHorizontal: wp(5),
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    stepIcon: {
        width: scale(52),
        height: scale(52),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepInfo: {
        flex: 1,
        marginLeft: scale(14),
    },
    stepName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: THEME.text,
    },
    stepDuration: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
    },
    stepNumber: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
    },
    benefitsCard: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(18),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(14),
    },
    benefitIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitText: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginLeft: scale(12),
        flex: 1,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        marginTop: hp(3),
        marginBottom: hp(1.5),
    },
    viewAll: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.primary,
    },
    recentList: {
        paddingHorizontal: wp(5),
    },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    recentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    recentIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(14),
        backgroundColor: THEME.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentInfo: {
        marginLeft: scale(12),
    },
    recentDate: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: THEME.text,
    },
    recentTime: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    recentRight: {
        alignItems: 'center',
        marginRight: scale(8),
    },
    scoreCircle: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
    },
    scoreStatus: {
        fontSize: moderateScale(11),
        fontWeight: '600',
        marginTop: verticalScale(4),
    },
    tipsCard: {
        backgroundColor: '#FEF9C3',
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        borderRadius: scale(16),
        padding: scale(18),
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    tipsIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: '#FEFCE8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipsTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: THEME.text,
        marginLeft: scale(12),
    },
    tipsList: {
        gap: verticalScale(10),
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: '#F59E0B',
        marginRight: scale(12),
    },
    tipText: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        flex: 1,
    },
});
