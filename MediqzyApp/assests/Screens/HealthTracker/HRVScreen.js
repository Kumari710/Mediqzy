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
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Theme colors for HRV (Teal/Cyan theme)
const THEME = {
    primary: '#1ABC9C',
    primaryDark: '#16A085',
    primaryLight: '#E8F8F5',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const HRVScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const periods = ['Day', 'Week', 'Month'];

    const currentHRV = 45;
    const avgHRV = 48;

    // Animation refs
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const cardAnims = useRef(new Array(3).fill(0).map(() => new Animated.Value(0))).current;

    // HRV levels interpretation
    const getHRVStatus = (hrv) => {
        if (hrv >= 50) return { text: 'Excellent', color: '#27AE60', icon: 'trophy' };
        if (hrv >= 40) return { text: 'Good', color: '#3498DB', icon: 'thumbs-up' };
        if (hrv >= 30) return { text: 'Fair', color: '#F59E0B', icon: 'refresh' };
        return { text: 'Low', color: '#E74C3C', icon: 'alert-circle' };
    };

    const status = getHRVStatus(currentHRV);

    // Weekly data
    const weeklyData = [
        { day: 'Mon', hrv: 42 },
        { day: 'Tue', hrv: 48 },
        { day: 'Wed', hrv: 45 },
        { day: 'Thu', hrv: 52 },
        { day: 'Fri', hrv: 39 },
        { day: 'Sat', hrv: 46 },
        { day: 'Sun', hrv: 45 },
    ];

    // Info cards
    const infoCards = [
        { label: 'Recovery', value: 'Good', icon: 'trending-up', color: '#27AE60' },
        { label: 'Stress', value: 'Low', icon: 'pulse', color: '#3498DB' },
        { label: 'Sleep', value: '85%', icon: 'moon', color: '#9B59B6' },
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
                toValue: (currentHRV / 100) * 100,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Wave animation loop
        startWaveAnimation();

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

        // Card animations with stagger
        cardAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 400 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    const startWaveAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // HRV Gauge Component
    const HRVGauge = ({ size = scale(180), strokeWidth = scale(14) }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;

        const strokeDashoffset = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, circumference * 0.2],
        });

        return (
            <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="hrvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={THEME.primaryLight} />
                            <Stop offset="50%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryDark} />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#E8F8F5"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#hrvGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Animated.View style={{
                        transform: [{
                            scale: waveAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.1],
                            })
                        }]
                    }}>
                        <Ionicons name="analytics" size={moderateScale(32)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={[styles.hrvValue, { color: status.color }]}>{currentHRV}</Text>
                    <Text style={styles.hrvUnit}>ms</Text>
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
        const maxHRV = 60;

        return (
            <View style={styles.chartContainer}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(35)}>
                    <Defs>
                        <LinearGradient id="hrvBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryLight} />
                        </LinearGradient>
                        <LinearGradient id="hrvBarActive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primaryDark} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.map((item, index) => {
                        const barHeight = (item.hrv / maxHRV) * chartHeight;
                        const x = scale(20) + index * (barWidth + spacing);
                        const isToday = index === weeklyData.length - 1;
                        const itemStatus = getHRVStatus(item.hrv);

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
                                    fill={isToday ? "url(#hrvBarActive)" : itemStatus.color}
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
                    <Text style={styles.headerTitle}>HRV</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="information-circle-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Period Selector */}
                    <View style={styles.periodContainer}>
                        <View style={styles.periodSelector}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period}
                                    style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
                                    onPress={() => setSelectedPeriod(period)}
                                >
                                    <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                                        {period}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* HRV Display */}
                    <View style={styles.hrvDisplay}>
                        <HRVGauge />
                        <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                            <Ionicons name={status.icon} size={moderateScale(14)} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                        </View>
                        <Text style={styles.hrvDescription}>Heart Rate Variability</Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCards}>
                        {infoCards.map((card, index) => {
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
                                <Animated.View key={index} style={[styles.infoCard, animStyle]}>
                                    <View style={[styles.infoIcon, { backgroundColor: `${card.color}15` }]}>
                                        <Ionicons name={card.icon} size={scale(20)} color={card.color} />
                                    </View>
                                    <Text style={styles.infoLabel}>{card.label}</Text>
                                    <Text style={[styles.infoValue, { color: card.color }]}>{card.value}</Text>
                                </Animated.View>
                            );
                        })}
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

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#E8F8F5' }]}>
                            <Text style={styles.statLabel}>Average</Text>
                            <Text style={[styles.statValue, { color: THEME.primary }]}>{avgHRV} ms</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={styles.statLabel}>Highest</Text>
                            <Text style={[styles.statValue, { color: '#27AE60' }]}>52 ms</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                            <Text style={styles.statLabel}>Lowest</Text>
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>39 ms</Text>
                        </View>
                    </View>

                    {/* What is HRV */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoSectionHeader}>
                            <Ionicons name="help-circle" size={scale(24)} color={THEME.primary} />
                            <Text style={styles.infoTitle}>What is HRV?</Text>
                        </View>
                        <Text style={styles.infoText}>
                            Heart Rate Variability (HRV) measures the variation in time between heartbeats.
                            Higher HRV generally indicates better cardiovascular fitness, stress resilience, and recovery.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default HRVScreen;

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
    periodContainer: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: THEME.background,
        borderRadius: scale(12),
        padding: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    periodButton: {
        flex: 1,
        paddingVertical: hp(1.2),
        alignItems: 'center',
        borderRadius: scale(10),
    },
    periodButtonActive: {
        backgroundColor: THEME.primary,
    },
    periodText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.textSecondary,
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    hrvDisplay: {
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
    hrvValue: {
        fontSize: moderateScale(46),
        fontWeight: '700',
        marginTop: verticalScale(4),
    },
    hrvUnit: {
        fontSize: moderateScale(18),
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
    hrvDescription: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginTop: hp(1),
    },
    infoCards: {
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        marginBottom: hp(2),
    },
    infoCard: {
        flex: 1,
        backgroundColor: THEME.background,
        borderRadius: scale(16),
        padding: scale(14),
        alignItems: 'center',
        marginHorizontal: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoIcon: {
        width: scale(42),
        height: scale(42),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    infoLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginBottom: verticalScale(4),
    },
    infoValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
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
    seeMore: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.primary,
    },
    chartContainer: {
        alignItems: 'center',
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
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginBottom: verticalScale(4),
    },
    statValue: {
        fontSize: moderateScale(17),
        fontWeight: '700',
    },
    infoSection: {
        backgroundColor: THEME.primaryLight,
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: THEME.primary,
    },
    infoSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1),
        gap: scale(8),
    },
    infoTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: THEME.text,
    },
    infoText: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        lineHeight: moderateScale(20),
    },
});
