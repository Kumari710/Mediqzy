import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G, Rect, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Theme colors for Stress (Orange theme)
const THEME = {
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#FFF7ED',
    calm: '#27AE60',
    moderate: '#F59E0B',
    high: '#E74C3C',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const StressScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const periods = ['Day', 'Week', 'Month'];

    const currentStress = 25; // 0-100

    // Animation refs
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const tipAnims = useRef(new Array(4).fill(0).map(() => new Animated.Value(0))).current;

    // Stress level interpretation
    const getStressStatus = (level) => {
        if (level <= 25) return { text: 'Relaxed', color: '#27AE60', icon: 'happy', emoji: '😊' };
        if (level <= 50) return { text: 'Moderate', color: '#F59E0B', icon: 'happy-outline', emoji: '😐' };
        if (level <= 75) return { text: 'High', color: '#E67E22', icon: 'sad-outline', emoji: '😟' };
        return { text: 'Very High', color: '#E74C3C', icon: 'sad', emoji: '😰' };
    };

    const status = getStressStatus(currentStress);

    // Weekly data
    const weeklyData = [
        { day: 'Mon', stress: 30 },
        { day: 'Tue', stress: 45 },
        { day: 'Wed', stress: 55 },
        { day: 'Thu', stress: 35 },
        { day: 'Fri', stress: 40 },
        { day: 'Sat', stress: 20 },
        { day: 'Sun', stress: 25 },
    ];

    // Relaxation tips
    const tips = [
        { id: 1, title: 'Deep Breathing', icon: 'leaf', description: '5 minutes of deep breathing', color: '#27AE60' },
        { id: 2, title: 'Take a Walk', icon: 'walk', description: '10-minute outdoor walk', color: '#3498DB' },
        { id: 3, title: 'Meditation', icon: 'flower', description: 'Guided meditation session', color: '#9B59B6' },
        { id: 4, title: 'Listen to Music', icon: 'musical-notes', description: 'Relaxing music playlist', color: '#E91E63' },
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
            Animated.timing(progressAnim, {
                toValue: currentStress,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Breathing animation
        startBreathingAnimation();

        // Chart animations with stagger
        chartAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: 600 + index * 60,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
            }).start();
        });

        // Tip animations with stagger
        tipAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 1000 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    const startBreathingAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breatheAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // Stress Gauge Component (Semi-circle)
    const StressGauge = ({ size = scale(200), strokeWidth = scale(18) }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * Math.PI * 1.5; // 270 degrees

        const strokeDashoffset = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
        });

        return (
            <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#27AE60" />
                            <Stop offset="50%" stopColor="#F59E0B" />
                            <Stop offset="100%" stopColor="#E74C3C" />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-225" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F1F5F9"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference * 2}`}
                            strokeLinecap="round"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#stressGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference * 2}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
                        <Ionicons name={status.icon} size={moderateScale(40)} color={status.color} />
                    </Animated.View>
                    <Text style={[styles.stressValue, { color: status.color }]}>{currentStress}%</Text>
                    <Text style={styles.stressLabel}>{status.text}</Text>
                </View>
            </Animated.View>
        );
    };

    // Bar Chart Component
    const BarChart = () => {
        const chartHeight = scale(90);
        const barWidth = scale(28);
        const numBars = weeklyData.length;
        const totalWidth = width - scale(80);
        const spacing = (totalWidth - barWidth * numBars) / (numBars - 1);

        return (
            <View style={styles.chartContainer}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(35)}>
                    <Defs>
                        <LinearGradient id="stressBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryLight} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.map((item, index) => {
                        const barHeight = (item.stress / 100) * chartHeight;
                        const x = scale(20) + index * (barWidth + spacing);
                        const isToday = index === weeklyData.length - 1;
                        const itemStatus = getStressStatus(item.stress);

                        const animValue = chartAnims[index];
                        const animatedHeight = animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, barHeight],
                        });
                        const animatedY = animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [scale(5) + chartHeight, scale(5) + (chartHeight - barHeight)],
                        });

                        return (
                            <G key={index}>
                                <Rect
                                    x={x}
                                    y={scale(5)}
                                    width={barWidth}
                                    height={chartHeight}
                                    rx={scale(8)}
                                    fill="#F1F5F9"
                                />
                                <AnimatedRect
                                    x={x}
                                    y={animatedY}
                                    width={barWidth}
                                    height={animatedHeight}
                                    rx={scale(8)}
                                    fill={isToday ? "url(#stressBarGradient)" : itemStatus.color}
                                />
                                <SvgText
                                    x={x + barWidth / 2}
                                    y={chartHeight + scale(25)}
                                    fontSize={scale(11)}
                                    fill={isToday ? THEME.primaryDark : "#64748B"}
                                    textAnchor="middle"
                                    fontWeight={isToday ? "700" : "500"}
                                >
                                    {item.day}
                                </SvgText>
                            </G>
                        );
                    })}
                </Svg>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Stress Level</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="information-circle-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Stress Gauge */}
                    <View style={styles.gaugeSection}>
                        <StressGauge />
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="today" size={scale(18)} color="#27AE60" />
                            <Text style={[styles.statValue, { color: '#27AE60' }]}>28%</Text>
                            <Text style={styles.statLabel}>Today Avg</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: THEME.primaryLight }]}>
                            <Ionicons name="calendar" size={scale(18)} color={THEME.primary} />
                            <Text style={[styles.statValue, { color: THEME.primary }]}>36%</Text>
                            <Text style={styles.statLabel}>Week Avg</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="trending-up" size={scale(18)} color="#F59E0B" />
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>55%</Text>
                            <Text style={styles.statLabel}>Peak</Text>
                        </View>
                    </View>

                    {/* Measure Button */}
                    <TouchableOpacity style={styles.measureButton} activeOpacity={0.8}>
                        <Ionicons name="fitness" size={scale(22)} color="#FFFFFF" />
                        <Text style={styles.measureButtonText}>Measure Stress Level</Text>
                    </TouchableOpacity>

                    {/* Weekly Chart */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Weekly Overview</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <BarChart />
                    </View>

                    {/* Relaxation Tips */}
                    <Text style={styles.sectionTitleFull}>Relaxation Tips</Text>
                    <View style={styles.tipsList}>
                        {tips.map((tip, index) => {
                            const animStyle = {
                                opacity: tipAnims[index],
                                transform: [{
                                    translateX: tipAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={tip.id} style={animStyle}>
                                    <TouchableOpacity style={styles.tipCard} activeOpacity={0.7}>
                                        <View style={[styles.tipIcon, { backgroundColor: `${tip.color}15` }]}>
                                            <Ionicons name={tip.icon} size={scale(24)} color={tip.color} />
                                        </View>
                                        <View style={styles.tipInfo}>
                                            <Text style={styles.tipTitle}>{tip.title}</Text>
                                            <Text style={styles.tipDescription}>{tip.description}</Text>
                                        </View>
                                        <View style={styles.tipArrow}>
                                            <Ionicons name="chevron-forward" size={scale(20)} color="#CBD5E1" />
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default StressScreen;

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
        color: '#1E3A8A',
    },
    menuButton: {
        padding: scale(8),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    gaugeSection: {
        alignItems: 'center',
        paddingVertical: hp(2.5),
    },
    gaugeContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    stressValue: {
        fontSize: moderateScale(38),
        fontWeight: '700',
        marginTop: verticalScale(6),
    },
    stressLabel: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    statCard: {
        borderRadius: scale(16),
        padding: scale(14),
        width: '31%',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: moderateScale(10),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
    },
    statValue: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        marginTop: verticalScale(6),
    },
    measureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.primary,
        marginHorizontal: wp(5),
        paddingVertical: hp(1.8),
        borderRadius: scale(14),
        gap: scale(10),
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    measureButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    chartSection: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        borderRadius: scale(20),
        padding: scale(18),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: THEME.text,
    },
    sectionTitleFull: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        paddingHorizontal: wp(5),
        marginTop: hp(2.5),
        marginBottom: hp(1.5),
    },
    seeMore: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.primary,
    },
    chartContainer: {
        alignItems: 'center',
    },
    tipsList: {
        paddingHorizontal: wp(5),
    },
    tipCard: {
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
    tipIcon: {
        width: scale(52),
        height: scale(52),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipInfo: {
        flex: 1,
        marginLeft: scale(14),
    },
    tipTitle: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: THEME.text,
    },
    tipDescription: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    tipArrow: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
