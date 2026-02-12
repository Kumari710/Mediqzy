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
import Svg, { Circle, G, Line, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

// Theme colors
const THEME = {
    systolic: '#E74C3C',
    diastolic: '#3498DB',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const BloodPressureScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const periods = ['Day', 'Week', 'Month'];

    const currentBP = { systolic: 120, diastolic: 80 };
    const pulseRate = 72;

    // Animation refs
    const sysAnim = useRef(new Animated.Value(0)).current;
    const diaAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnims = useRef(new Array(3).fill(0).map(() => new Animated.Value(0))).current;

    // BP Category
    const getBPCategory = (sys, dia) => {
        if (sys < 120 && dia < 80) return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
        if (sys < 130 && dia < 80) return { text: 'Elevated', color: '#F59E0B', icon: 'warning' };
        if (sys < 140 || dia < 90) return { text: 'High Stage 1', color: '#E67E22', icon: 'alert-circle' };
        if (sys >= 140 || dia >= 90) return { text: 'High Stage 2', color: '#E74C3C', icon: 'alert-circle' };
        return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
    };

    const category = getBPCategory(currentBP.systolic, currentBP.diastolic);

    // Weekly data
    const weeklyData = [
        { day: 'Mon', sys: 118, dia: 78 },
        { day: 'Tue', sys: 122, dia: 82 },
        { day: 'Wed', sys: 125, dia: 85 },
        { day: 'Thu', sys: 119, dia: 79 },
        { day: 'Fri', sys: 121, dia: 80 },
        { day: 'Sat', sys: 117, dia: 76 },
        { day: 'Sun', sys: 120, dia: 80 },
    ];

    // Recent readings
    const readings = [
        { time: 'Today, 8:00 AM', sys: 120, dia: 80, pulse: 72, status: 'Normal' },
        { time: 'Yesterday, 8:00 PM', sys: 118, dia: 78, pulse: 68, status: 'Normal' },
        { time: 'Yesterday, 8:00 AM', sys: 122, dia: 82, pulse: 75, status: 'Elevated' },
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
            Animated.timing(sysAnim, {
                toValue: currentBP.systolic,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(diaAnim, {
                toValue: currentBP.diastolic,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        cardAnims.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 800 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    // BP Chart Component with dual lines
    const BPChart = () => {
        const chartHeight = scale(100);
        const chartWidth = width - scale(80);
        const pointSpacing = chartWidth / (weeklyData.length - 1);
        const maxBP = 150;
        const minBP = 60;
        const range = maxBP - minBP;

        const sysPoints = weeklyData.map((item, index) => ({
            x: scale(20) + index * pointSpacing,
            y: scale(15) + chartHeight - ((item.sys - minBP) / range) * chartHeight,
        }));

        const diaPoints = weeklyData.map((item, index) => ({
            x: scale(20) + index * pointSpacing,
            y: scale(15) + chartHeight - ((item.dia - minBP) / range) * chartHeight,
        }));

        const sysPathData = sysPoints
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

        const diaPathData = diaPoints
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

        return (
            <View style={styles.chartContainer}>
                <Svg width={width - scale(40)} height={chartHeight + scale(50)}>
                    <Defs>
                        <LinearGradient id="sysGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FFCDD2" />
                            <Stop offset="100%" stopColor="#E74C3C" />
                        </LinearGradient>
                        <LinearGradient id="diaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#BBDEFB" />
                            <Stop offset="100%" stopColor="#3498DB" />
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
                    {/* Systolic line */}
                    <Path
                        d={sysPathData}
                        stroke="url(#sysGradient)"
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Diastolic line */}
                    <Path
                        d={diaPathData}
                        stroke="url(#diaGradient)"
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Points */}
                    {sysPoints.map((point, index) => (
                        <G key={`sys-${index}`}>
                            <Circle cx={point.x} cy={point.y} r={scale(5)} fill={THEME.systolic} />
                            <Circle cx={point.x} cy={point.y} r={scale(2.5)} fill="#FFFFFF" />
                        </G>
                    ))}
                    {diaPoints.map((point, index) => (
                        <G key={`dia-${index}`}>
                            <Circle cx={point.x} cy={point.y} r={scale(5)} fill={THEME.diastolic} />
                            <Circle cx={point.x} cy={point.y} r={scale(2.5)} fill="#FFFFFF" />
                        </G>
                    ))}
                    {/* Labels */}
                    {weeklyData.map((item, index) => (
                        <SvgText
                            key={index}
                            x={scale(20) + index * pointSpacing}
                            y={chartHeight + scale(35)}
                            fontSize={scale(11)}
                            fill="#64748B"
                            textAnchor="middle"
                        >
                            {item.day}
                        </SvgText>
                    ))}
                </Svg>
                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: THEME.systolic }]} />
                        <Text style={styles.legendText}>Systolic</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: THEME.diastolic }]} />
                        <Text style={styles.legendText}>Diastolic</Text>
                    </View>
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
                    <Text style={styles.headerTitle}>Blood Pressure</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="calendar-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Period Selector */}
                    <View style={styles.periodContainer}>
                        <View style={styles.periodSelector}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period}
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === period && styles.periodButtonActive,
                                    ]}
                                    onPress={() => setSelectedPeriod(period)}
                                >
                                    <Text
                                        style={[
                                            styles.periodText,
                                            selectedPeriod === period && styles.periodTextActive,
                                        ]}
                                    >
                                        {period}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* BP Display */}
                    <Animated.View style={[styles.bpDisplay, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.bpCard}>
                            <View style={styles.bpValues}>
                                <View style={styles.bpValue}>
                                    <View style={[styles.bpIcon, { backgroundColor: '#FFEBEE' }]}>
                                        <Ionicons name="arrow-up" size={scale(18)} color={THEME.systolic} />
                                    </View>
                                    <Text style={[styles.bpNumber, { color: THEME.systolic }]}>{currentBP.systolic}</Text>
                                    <Text style={styles.bpValueLabel}>Systolic</Text>
                                </View>
                                <View style={styles.bpDivider}>
                                    <Text style={styles.bpSlash}>/</Text>
                                </View>
                                <View style={styles.bpValue}>
                                    <View style={[styles.bpIcon, { backgroundColor: '#E3F2FD' }]}>
                                        <Ionicons name="arrow-down" size={scale(18)} color={THEME.diastolic} />
                                    </View>
                                    <Text style={[styles.bpNumber, { color: THEME.diastolic }]}>{currentBP.diastolic}</Text>
                                    <Text style={styles.bpValueLabel}>Diastolic</Text>
                                </View>
                            </View>
                            <Text style={styles.bpUnit}>mmHg</Text>
                            <View style={[styles.categoryBadge, { backgroundColor: `${category.color}15` }]}>
                                <Ionicons name={category.icon} size={moderateScale(14)} color={category.color} />
                                <Text style={[styles.categoryText, { color: category.color }]}>{category.text}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Pulse Rate Card */}
                    <View style={styles.pulseCard}>
                        <View style={styles.pulseLeft}>
                            <View style={styles.pulseIcon}>
                                <Ionicons name="heart" size={scale(22)} color="#E91E63" />
                            </View>
                            <View>
                                <Text style={styles.pulseLabel}>Pulse Rate</Text>
                                <Text style={styles.pulseValue}>{pulseRate} <Text style={styles.pulseUnit}>bpm</Text></Text>
                            </View>
                        </View>
                        <View style={[styles.pulseStatus, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.pulseStatusText, { color: '#27AE60' }]}>Normal</Text>
                        </View>
                    </View>

                    {/* Measure Button */}
                    <TouchableOpacity style={styles.measureButton} activeOpacity={0.8}>
                        <Ionicons name="pulse" size={scale(22)} color="#FFFFFF" />
                        <Text style={styles.measureButtonText}>Measure Blood Pressure</Text>
                    </TouchableOpacity>

                    {/* Chart */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Weekly Trend</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <BPChart />
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
                            const statusColor = reading.status === 'Normal' ? '#27AE60' : '#F59E0B';

                            return (
                                <Animated.View key={index} style={animStyle}>
                                    <View style={styles.readingItem}>
                                        <View style={styles.readingLeft}>
                                            <Ionicons name="time-outline" size={scale(16)} color="#94A3B8" />
                                            <Text style={styles.readingTime}>{reading.time}</Text>
                                        </View>
                                        <View style={styles.readingCenter}>
                                            <Text style={styles.readingBP}>
                                                <Text style={{ color: THEME.systolic }}>{reading.sys}</Text>
                                                <Text style={{ color: '#94A3B8' }}> / </Text>
                                                <Text style={{ color: THEME.diastolic }}>{reading.dia}</Text>
                                            </Text>
                                            <Text style={styles.readingPulse}>❤️ {reading.pulse} bpm</Text>
                                        </View>
                                        <View style={[styles.readingStatus, { backgroundColor: `${statusColor}15` }]}>
                                            <Text style={[styles.readingStatusText, { color: statusColor }]}>
                                                {reading.status}
                                            </Text>
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

export default BloodPressureScreen;

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
        backgroundColor: THEME.diastolic,
    },
    periodText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.textSecondary,
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    bpDisplay: {
        paddingHorizontal: wp(5),
        paddingTop: hp(3),
    },
    bpCard: {
        backgroundColor: THEME.background,
        borderRadius: scale(24),
        padding: scale(24),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    bpValues: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bpValue: {
        alignItems: 'center',
    },
    bpIcon: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    bpNumber: {
        fontSize: moderateScale(44),
        fontWeight: '700',
    },
    bpValueLabel: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
    },
    bpDivider: {
        marginHorizontal: scale(20),
    },
    bpSlash: {
        fontSize: moderateScale(36),
        color: '#CBD5E1',
        fontWeight: '300',
    },
    bpUnit: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        marginTop: hp(1),
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    categoryText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    pulseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        borderRadius: scale(16),
        padding: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    pulseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulseIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(14),
        backgroundColor: '#FCE4EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(14),
    },
    pulseLabel: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
    },
    pulseValue: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#E91E63',
        marginTop: verticalScale(2),
    },
    pulseUnit: {
        fontSize: moderateScale(14),
        fontWeight: '400',
    },
    pulseStatus: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(12),
    },
    pulseStatusText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
    },
    measureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.diastolic,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        paddingVertical: hp(1.8),
        borderRadius: scale(14),
        gap: scale(10),
        shadowColor: THEME.diastolic,
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
        marginTop: hp(3),
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
        marginTop: hp(3),
        marginBottom: hp(1.5),
    },
    seeMore: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.diastolic,
    },
    chartContainer: {
        alignItems: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(1.5),
        gap: scale(24),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        marginRight: scale(6),
    },
    legendText: {
        fontSize: moderateScale(12),
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
        flex: 1,
    },
    readingTime: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginLeft: scale(6),
    },
    readingCenter: {
        alignItems: 'center',
    },
    readingBP: {
        fontSize: moderateScale(18),
        fontWeight: '700',
    },
    readingPulse: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    readingStatus: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(10),
    },
    readingStatusText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
    },
});
