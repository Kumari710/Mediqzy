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
import Svg, { Circle, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Theme colors for SpO2 (Purple theme)
const THEME = {
    primary: '#9B59B6',
    primaryDark: '#7B1FA2',
    primaryLight: '#F3E5F5',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const SpO2Screen = ({ navigation }) => {
    const [isMonitoring, setIsMonitoring] = useState(false);

    const currentSpO2 = 98;

    // Animation refs
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const cardAnims = useRef(new Array(3).fill(0).map(() => new Animated.Value(0))).current;

    // SpO2 Status
    const getSpO2Status = (level) => {
        if (level >= 95) return { text: 'Excellent', color: '#27AE60', icon: 'checkmark-circle' };
        if (level >= 90) return { text: 'Low', color: '#F59E0B', icon: 'warning' };
        return { text: 'Critical', color: '#E74C3C', icon: 'alert-circle' };
    };

    const status = getSpO2Status(currentSpO2);

    // Weekly data
    const weeklyData = [
        { day: 'Mon', spo2: 97 },
        { day: 'Tue', spo2: 98 },
        { day: 'Wed', spo2: 96 },
        { day: 'Thu', spo2: 99 },
        { day: 'Fri', spo2: 98 },
        { day: 'Sat', spo2: 97 },
        { day: 'Sun', spo2: 98 },
    ];

    // Readings
    const readings = [
        { time: 'Today, 8:00 AM', value: 98, status: 'Normal' },
        { time: 'Yesterday, 10:00 PM', value: 97, status: 'Normal' },
        { time: 'Yesterday, 8:00 AM', value: 96, status: 'Normal' },
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
                toValue: currentSpO2,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Start pulsing animation
        startPulseAnimation();

        // Bar animations with stagger
        chartAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: 600 + index * 60,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
            }).start();
        });

        // Card animations with stagger
        cardAnims.forEach((anim, index) => {
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
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // Circular Progress Component
    const SpO2Gauge = ({ size = scale(200), strokeWidth = scale(16) }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;

        const strokeDashoffset = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
        });

        return (
            <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="spo2Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#E1BEE7" />
                            <Stop offset="50%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryDark} />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F3E5F5"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#spo2Gradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <Ionicons name="water" size={moderateScale(32)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={[styles.spo2Value, { color: status.color }]}>{currentSpO2}%</Text>
                    <Text style={styles.spo2Label}>SpO₂</Text>
                </View>
            </Animated.View>
        );
    };

    // Bar Chart with animations
    const BarChart = () => {
        const chartHeight = scale(90);
        const barWidth = scale(30);
        const numBars = weeklyData.length;
        const totalWidth = width - scale(80);
        const spacing = (totalWidth - barWidth * numBars) / (numBars - 1);
        const minSpo2 = 90;
        const maxSpo2 = 100;

        return (
            <View style={styles.chartContainer}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(35)}>
                    <Defs>
                        <LinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor="#E1BEE7" />
                        </LinearGradient>
                        <LinearGradient id="barGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primaryDark} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.map((item, index) => {
                        const barHeight = ((item.spo2 - minSpo2) / (maxSpo2 - minSpo2)) * chartHeight;
                        const x = scale(20) + index * (barWidth + spacing);
                        const isToday = index === weeklyData.length - 1;

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
                                    fill={THEME.primaryLight}
                                />
                                <AnimatedRect
                                    x={x}
                                    y={animatedY}
                                    width={barWidth}
                                    height={animatedHeight}
                                    rx={scale(8)}
                                    fill={isToday ? "url(#barGradientActive)" : "url(#barGradient)"}
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

    const AnimatedRect = Animated.createAnimatedComponent(Rect);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>SpO₂</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="information-circle-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* SpO2 Gauge */}
                    <View style={styles.gaugeSection}>
                        <SpO2Gauge />
                        <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                            <Ionicons name={status.icon} size={moderateScale(14)} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
                            <Ionicons name="trending-up" size={scale(18)} color={THEME.primary} />
                            <Text style={[styles.statValue, { color: THEME.primary }]}>97%</Text>
                            <Text style={styles.statLabel}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="arrow-down" size={scale(18)} color="#F59E0B" />
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>96%</Text>
                            <Text style={styles.statLabel}>Lowest</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="arrow-up" size={scale(18)} color="#27AE60" />
                            <Text style={[styles.statValue, { color: '#27AE60' }]}>99%</Text>
                            <Text style={styles.statLabel}>Highest</Text>
                        </View>
                    </View>

                    {/* Measure Button */}
                    <TouchableOpacity
                        style={[styles.measureButton, isMonitoring && styles.measureButtonActive]}
                        onPress={() => setIsMonitoring(!isMonitoring)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={isMonitoring ? "stop-circle" : "water"} size={scale(22)} color="#FFFFFF" />
                        <Text style={styles.measureButtonText}>
                            {isMonitoring ? 'Stop Measurement' : 'Measure SpO₂'}
                        </Text>
                    </TouchableOpacity>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="information-circle" size={scale(24)} color={THEME.primary} />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>What is SpO₂?</Text>
                            <Text style={styles.infoText}>
                                Blood Oxygen Saturation measures the percentage of oxygen-carrying hemoglobin in your blood. Normal levels are typically 95-100%.
                            </Text>
                        </View>
                    </View>

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

                    {/* Readings History */}
                    <Text style={styles.sectionTitleFull}>Recent Readings</Text>
                    <View style={styles.readingsList}>
                        {readings.map((reading, index) => {
                            const animStyle = {
                                opacity: cardAnims[index],
                                transform: [{
                                    translateY: cardAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                }],
                            };

                            return (
                                <Animated.View key={index} style={animStyle}>
                                    <View style={styles.readingItem}>
                                        <View style={styles.readingLeft}>
                                            <View style={[styles.readingDot, { backgroundColor: THEME.primary }]} />
                                            <View>
                                                <Text style={styles.readingTime}>{reading.time}</Text>
                                                <View style={[styles.readingStatusBadge, { backgroundColor: '#E8F5E9' }]}>
                                                    <Text style={[styles.readingStatusText, { color: '#27AE60' }]}>
                                                        {reading.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={[styles.readingValue, { color: THEME.primary }]}>
                                            {reading.value}%
                                        </Text>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default SpO2Screen;

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
        paddingVertical: hp(3),
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
    spo2Value: {
        fontSize: moderateScale(44),
        fontWeight: '700',
        marginTop: verticalScale(4),
    },
    spo2Label: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    statusText: {
        fontSize: moderateScale(14),
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
        alignItems: 'center',
        width: '31%',
    },
    statValue: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        marginTop: verticalScale(6),
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
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
    measureButtonActive: {
        backgroundColor: THEME.primaryDark,
    },
    measureButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: THEME.primaryLight,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    infoIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#E1BEE7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
        marginLeft: scale(14),
    },
    infoTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: THEME.text,
        marginBottom: verticalScale(4),
    },
    infoText: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        lineHeight: moderateScale(18),
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
    readingsList: {
        paddingHorizontal: wp(5),
    },
    readingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    readingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readingDot: {
        width: scale(6),
        height: scale(36),
        borderRadius: scale(3),
        marginRight: scale(14),
    },
    readingTime: {
        fontSize: moderateScale(14),
        color: THEME.text,
        fontWeight: '500',
    },
    readingStatusBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: scale(6),
        marginTop: verticalScale(4),
        alignSelf: 'flex-start',
    },
    readingStatusText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
    },
    readingValue: {
        fontSize: moderateScale(26),
        fontWeight: '700',
    },
});
