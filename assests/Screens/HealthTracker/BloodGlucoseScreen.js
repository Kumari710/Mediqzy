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
import Svg, { Circle, G, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

// Theme colors for Blood Glucose (Orange/Amber theme)
const THEME = {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FEF3C7',
    normal: '#27AE60',
    elevated: '#F59E0B',
    high: '#E74C3C',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const BloodGlucoseScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Day');
    const periods = ['Day', 'Week', 'Month'];

    const currentGlucose = 95;

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const glucoseAnim = useRef(new Animated.Value(0)).current;
    const cardAnims = useRef(new Array(4).fill(0).map(() => new Animated.Value(0))).current;

    // Glucose status
    const getGlucoseStatus = (level, time = 'fasting') => {
        if (time === 'fasting') {
            if (level < 70) return { text: 'Low', color: '#3498DB', icon: 'arrow-down-circle' };
            if (level < 100) return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
            if (level < 126) return { text: 'Pre-Diabetic', color: '#F59E0B', icon: 'warning' };
            return { text: 'Diabetic', color: '#E74C3C', icon: 'alert-circle' };
        }
        return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
    };

    const status = getGlucoseStatus(currentGlucose);

    // Daily readings
    const dailyReadings = [
        { time: '7:00 AM', value: 95, type: 'Fasting', icon: 'sunny-outline' },
        { time: '9:30 AM', value: 140, type: 'After Breakfast', icon: 'restaurant-outline' },
        { time: '1:00 PM', value: 125, type: 'After Lunch', icon: 'restaurant-outline' },
        { time: '5:00 PM', value: 110, type: 'Before Dinner', icon: 'time-outline' },
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
            Animated.timing(glucoseAnim, {
                toValue: currentGlucose,
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
                delay: 800 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    // Glucose Display Component
    const GlucoseDisplay = () => {
        const displayValue = glucoseAnim.interpolate({
            inputRange: [0, currentGlucose],
            outputRange: [0, currentGlucose],
        });

        return (
            <Animated.View style={[styles.glucoseCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.glucoseMainDisplay}>
                    <View style={[styles.glucoseIcon, { backgroundColor: `${status.color}15` }]}>
                        <Ionicons name="water" size={scale(32)} color={status.color} />
                    </View>
                    <View style={styles.glucoseValueContainer}>
                        <Text style={[styles.glucoseValue, { color: status.color }]}>{currentGlucose}</Text>
                        <Text style={styles.glucoseUnit}>mg/dL</Text>
                    </View>
                </View>
                <View style={styles.glucoseInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                        <Ionicons name={status.icon} size={moderateScale(14)} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                    </View>
                    <Text style={styles.readingType}>Fasting</Text>
                    <Text style={styles.readingTime}>7:00 AM</Text>
                </View>
            </Animated.View>
        );
    };

    // Line Chart Component
    const GlucoseChart = () => {
        const chartHeight = scale(100);
        const chartWidth = width - scale(80);
        const maxValue = 150;
        const minValue = 70;
        const pointSpacing = chartWidth / (dailyReadings.length - 1);

        const points = dailyReadings.map((item, index) => ({
            x: scale(20) + index * pointSpacing,
            y: scale(15) + chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight,
        }));

        const pathData = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');

        const normalRangeY = scale(15) + chartHeight - ((100 - minValue) / (maxValue - minValue)) * chartHeight;
        const normalRangeHeight = ((100 - 70) / (maxValue - minValue)) * chartHeight;

        return (
            <View style={styles.chartContainer}>
                <Svg width={width - scale(40)} height={chartHeight + scale(50)}>
                    <Defs>
                        <LinearGradient id="glucoseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={THEME.primaryLight} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>
                    {/* Normal range area */}
                    <Rect
                        x={scale(20)}
                        y={normalRangeY}
                        width={chartWidth}
                        height={normalRangeHeight}
                        fill="#E8F5E9"
                        opacity={0.5}
                    />
                    {/* Grid lines */}
                    {[70, 100, 126, 150].map((value, index) => {
                        const y = scale(15) + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
                        return (
                            <G key={index}>
                                <Line x1={scale(20)} y1={y} x2={chartWidth + scale(20)} y2={y} stroke="#F1F5F9" strokeWidth={1} />
                                <SvgText x={chartWidth + scale(30)} y={y + 4} fontSize={scale(10)} fill="#94A3B8">
                                    {value}
                                </SvgText>
                            </G>
                        );
                    })}
                    {/* Line path */}
                    <Path
                        d={pathData}
                        stroke="url(#glucoseGradient)"
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Points */}
                    {points.map((point, index) => {
                        const reading = dailyReadings[index];
                        const pointStatus = getGlucoseStatus(reading.value);
                        return (
                            <G key={index}>
                                <Circle cx={point.x} cy={point.y} r={scale(6)} fill={pointStatus.color} />
                                <Circle cx={point.x} cy={point.y} r={scale(3)} fill="#FFFFFF" />
                            </G>
                        );
                    })}
                </Svg>
                <View style={styles.chartLabels}>
                    {dailyReadings.map((item, index) => (
                        <Text key={index} style={styles.chartLabel}>{item.time.split(' ')[0]}</Text>
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
                    <Text style={styles.headerTitle}>Blood Glucose</Text>
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

                    {/* Current Reading */}
                    <GlucoseDisplay />

                    {/* Log Button */}
                    <TouchableOpacity style={styles.logButton} activeOpacity={0.8}>
                        <Ionicons name="add-circle" size={scale(22)} color="#FFFFFF" />
                        <Text style={styles.logButtonText}>Log Blood Glucose</Text>
                    </TouchableOpacity>

                    {/* Target Ranges */}
                    <View style={styles.rangesCard}>
                        <View style={styles.rangesHeader}>
                            <Ionicons name="shield-checkmark" size={scale(20)} color="#27AE60" />
                            <Text style={styles.rangesTitle}>Target Ranges</Text>
                        </View>
                        <View style={styles.rangeRow}>
                            <Text style={styles.rangeLabel}>Fasting</Text>
                            <View style={[styles.rangeBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.rangeValue, { color: '#27AE60' }]}>70-100 mg/dL</Text>
                            </View>
                        </View>
                        <View style={styles.rangeRow}>
                            <Text style={styles.rangeLabel}>After Meals (2hr)</Text>
                            <View style={[styles.rangeBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.rangeValue, { color: '#27AE60' }]}>&lt;140 mg/dL</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chart */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Today's Readings</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <GlucoseChart />
                    </View>

                    {/* Daily Readings */}
                    <Text style={styles.sectionTitleFull}>All Readings</Text>
                    <View style={styles.readingsList}>
                        {dailyReadings.map((reading, index) => {
                            const readingStatus = getGlucoseStatus(reading.value);
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
                                        <View style={[styles.readingIcon, { backgroundColor: `${THEME.primary}15` }]}>
                                            <Ionicons name={reading.icon} size={scale(20)} color={THEME.primary} />
                                        </View>
                                        <View style={styles.readingDetails}>
                                            <Text style={styles.readingItemTime}>{reading.time}</Text>
                                            <Text style={styles.readingItemType}>{reading.type}</Text>
                                        </View>
                                        <View style={styles.readingValueContainer}>
                                            <Text style={[styles.readingItemValue, { color: readingStatus.color }]}>
                                                {reading.value}
                                            </Text>
                                            <Text style={styles.readingItemUnit}>mg/dL</Text>
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

export default BloodGlucoseScreen;

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
    glucoseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        marginTop: hp(3),
        borderRadius: scale(24),
        padding: scale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    glucoseMainDisplay: {
        alignItems: 'center',
        marginRight: scale(30),
    },
    glucoseIcon: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    glucoseValueContainer: {
        alignItems: 'center',
    },
    glucoseValue: {
        fontSize: moderateScale(56),
        fontWeight: '700',
    },
    glucoseUnit: {
        fontSize: moderateScale(16),
        color: THEME.textSecondary,
        marginTop: -verticalScale(4),
    },
    glucoseInfo: {
        alignItems: 'flex-start',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(12),
        gap: scale(4),
    },
    statusText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    readingType: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(10),
    },
    readingTime: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    logButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.primary,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        paddingVertical: hp(1.8),
        borderRadius: scale(14),
        gap: scale(10),
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    logButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    rangesCard: {
        backgroundColor: THEME.primaryLight,
        marginHorizontal: wp(5),
        marginTop: hp(2),
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    rangesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
        gap: scale(8),
    },
    rangesTitle: {
        fontSize: moderateScale(15),
        fontWeight: '700',
        color: THEME.text,
    },
    rangeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(6),
    },
    rangeLabel: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
    },
    rangeBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: scale(8),
    },
    rangeValue: {
        fontSize: moderateScale(13),
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
    readingIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    readingDetails: {
        flex: 1,
        marginLeft: scale(14),
    },
    readingItemTime: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: THEME.text,
    },
    readingItemType: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    readingValueContainer: {
        alignItems: 'flex-end',
    },
    readingItemValue: {
        fontSize: moderateScale(24),
        fontWeight: '700',
    },
    readingItemUnit: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
    },
});
