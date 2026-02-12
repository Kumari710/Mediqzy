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
import Svg, { Circle, G, Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Theme colors
const THEME = {
    primary: '#E91E63',
    primaryDark: '#C2185B',
    primaryLight: '#FCE4EC',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const HeartRateMonitorScreen = ({ navigation }) => {
    const [isMonitoring, setIsMonitoring] = useState(false);

    const currentBPM = 72;
    const minBPM = 58;
    const maxBPM = 120;
    const avgBPM = 75;

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnims = useRef(new Array(5).fill(0).map(() => new Animated.Value(0))).current;

    const readings = [
        { time: '8:00 AM', value: 68, status: 'Resting', color: '#3498DB' },
        { time: '10:30 AM', value: 85, status: 'Active', color: '#F59E0B' },
        { time: '12:00 PM', value: 92, status: 'Post Meal', color: '#E74C3C' },
        { time: '2:00 PM', value: 78, status: 'Normal', color: '#27AE60' },
        { time: '4:30 PM', value: 72, status: 'Resting', color: '#3498DB' },
    ];

    const hourlyData = [
        { time: '6AM', bpm: 62 },
        { time: '8AM', bpm: 68 },
        { time: '10AM', bpm: 85 },
        { time: '12PM', bpm: 92 },
        { time: '2PM', bpm: 78 },
        { time: '4PM', bpm: 72 },
        { time: '6PM', bpm: 75 },
    ];

    useEffect(() => {
        startAnimations();
    }, []);

    const startAnimations = () => {
        // Progress animation
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
                toValue: ((currentBPM - 40) / 140) * 100,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Card animations with stagger
        cardAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 500 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });

        // Pulse animation loop
        startPulseAnimation();
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const getHeartRateZone = (bpm) => {
        if (bpm < 60) return { zone: 'Resting', color: '#3498DB' };
        if (bpm < 100) return { zone: 'Normal', color: '#27AE60' };
        if (bpm < 140) return { zone: 'Cardio', color: '#F59E0B' };
        return { zone: 'Peak', color: '#E74C3C' };
    };

    const zoneInfo = getHeartRateZone(currentBPM);

    // Circular Heart Rate Gauge
    const HeartRateGauge = ({ size = scale(200), strokeWidth = scale(14) }) => {
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
                        <LinearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FCE4EC" />
                            <Stop offset="50%" stopColor="#E91E63" />
                            <Stop offset="100%" stopColor="#C2185B" />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F8E8ED"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#heartGradient)"
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
                        <Ionicons name="heart" size={moderateScale(40)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={styles.bpmValue}>{currentBPM}</Text>
                    <Text style={styles.bpmLabel}>BPM</Text>
                </View>
            </Animated.View>
        );
    };

    // Line Chart Component with gradient
    const LineChart = () => {
        const chartHeight = scale(100);
        const chartWidth = width - scale(80);
        const maxBpm = Math.max(...hourlyData.map(d => d.bpm));
        const minBpm = Math.min(...hourlyData.map(d => d.bpm));
        const range = maxBpm - minBpm || 1;
        const pointSpacing = chartWidth / (hourlyData.length - 1);

        const points = hourlyData.map((item, index) => ({
            x: scale(20) + index * pointSpacing,
            y: scale(15) + chartHeight - ((item.bpm - minBpm) / range) * chartHeight,
        }));

        const pathData = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

        return (
            <View style={styles.chartContainer}>
                <Svg width={width - scale(40)} height={chartHeight + scale(50)}>
                    <Defs>
                        <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FCE4EC" />
                            <Stop offset="100%" stopColor="#E91E63" />
                        </LinearGradient>
                    </Defs>
                    {/* Grid lines */}
                    {[0, 0.5, 1].map((ratio, index) => (
                        <Line
                            key={index}
                            x1={scale(20)}
                            y1={scale(15) + chartHeight * ratio}
                            x2={chartWidth + scale(20)}
                            y2={scale(15) + chartHeight * ratio}
                            stroke="#F1F5F9"
                            strokeWidth={1}
                        />
                    ))}
                    {/* Line */}
                    <Path
                        d={pathData}
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Points */}
                    {points.map((point, index) => (
                        <G key={index}>
                            <Circle cx={point.x} cy={point.y} r={scale(6)} fill={THEME.primary} />
                            <Circle cx={point.x} cy={point.y} r={scale(3)} fill="#FFFFFF" />
                        </G>
                    ))}
                </Svg>
                <View style={styles.chartLabels}>
                    {hourlyData.map((item, index) => (
                        <Text key={index} style={styles.chartLabel}>{item.time}</Text>
                    ))}
                </View>
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
                    <Text style={styles.headerTitle}>Heart Rate</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="calendar-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Heart Rate Gauge */}
                    <View style={styles.gaugeSection}>
                        <HeartRateGauge />
                        <View style={[styles.zoneBadge, { backgroundColor: `${zoneInfo.color}20` }]}>
                            <Ionicons name="heart" size={moderateScale(14)} color={zoneInfo.color} />
                            <Text style={[styles.zoneText, { color: zoneInfo.color }]}>{zoneInfo.zone} Zone</Text>
                        </View>
                    </View>

                    {/* Start/Stop Button */}
                    <TouchableOpacity
                        style={[styles.measureButton, isMonitoring && styles.measureButtonActive]}
                        onPress={() => setIsMonitoring(!isMonitoring)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isMonitoring ? "stop-circle" : "play-circle"}
                            size={scale(24)}
                            color="#FFFFFF"
                        />
                        <Text style={styles.measureButtonText}>
                            {isMonitoring ? 'Stop Measurement' : 'Start Measurement'}
                        </Text>
                    </TouchableOpacity>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="arrow-down" size={scale(18)} color="#2196F3" />
                            <Text style={[styles.statValue, { color: '#2196F3' }]}>{minBPM}</Text>
                            <Text style={styles.statLabel}>Min BPM</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
                            <Ionicons name="remove" size={scale(18)} color={THEME.primary} />
                            <Text style={[styles.statValue, { color: THEME.primary }]}>{avgBPM}</Text>
                            <Text style={styles.statLabel}>Avg BPM</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="arrow-up" size={scale(18)} color="#E74C3C" />
                            <Text style={[styles.statValue, { color: '#E74C3C' }]}>{maxBPM}</Text>
                            <Text style={styles.statLabel}>Max BPM</Text>
                        </View>
                    </View>

                    {/* Chart */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Today's Trend</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <LineChart />
                    </View>

                    {/* Readings History */}
                    <Text style={styles.sectionTitleFull}>Today's Readings</Text>
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
                                            <View style={[styles.readingDot, { backgroundColor: reading.color }]} />
                                            <View>
                                                <Text style={styles.readingTimeText}>{reading.time}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: `${reading.color}15` }]}>
                                                    <Text style={[styles.statusText, { color: reading.color }]}>
                                                        {reading.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.readingValue}>
                                            <Text style={styles.readingBpm}>{reading.value}</Text>
                                            <Text style={styles.readingUnit}>bpm</Text>
                                        </View>
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

export default HeartRateMonitorScreen;

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
    bpmValue: {
        fontSize: moderateScale(42),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(4),
    },
    bpmLabel: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        fontWeight: '600',
    },
    zoneBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    zoneText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
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
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginTop: hp(3),
        marginBottom: hp(2),
    },
    statCard: {
        borderRadius: scale(16),
        padding: scale(16),
        alignItems: 'center',
        width: '31%',
    },
    statValue: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        marginTop: verticalScale(6),
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
    },
    chartSection: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(20),
        padding: scale(18),
        marginBottom: hp(2),
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
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width - scale(80),
        marginTop: -verticalScale(5),
    },
    chartLabel: {
        fontSize: moderateScale(10),
        color: THEME.textSecondary,
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
        width: scale(8),
        height: scale(40),
        borderRadius: scale(4),
        marginRight: scale(14),
    },
    readingTimeText: {
        fontSize: moderateScale(14),
        color: THEME.text,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: scale(6),
        marginTop: verticalScale(4),
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
    },
    readingValue: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    readingBpm: {
        fontSize: moderateScale(28),
        fontWeight: '700',
        color: THEME.primary,
    },
    readingUnit: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginLeft: scale(4),
    },
});
