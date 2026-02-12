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
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Theme colors for Temperature (Teal/Cyan theme)
const THEME = {
    primary: '#00BCD4',
    primaryDark: '#0097A7',
    primaryLight: '#E0F7FA',
    accent: '#FF5722',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const TemperatureScreen = ({ navigation }) => {
    const [unit, setUnit] = useState('F');

    const currentTemp = unit === 'F' ? 98.6 : 37.0;
    const normalRange = unit === 'F' ? '97.8°F - 99.1°F' : '36.5°C - 37.3°C';

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const thermometerAnim = useRef(new Animated.Value(0)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const cardAnims = useRef(new Array(3).fill(0).map(() => new Animated.Value(0))).current;

    // Weekly data
    const weeklyData = [
        { day: 'Mon', temp: 98.4 },
        { day: 'Tue', temp: 98.8 },
        { day: 'Wed', temp: 99.2 },
        { day: 'Thu', temp: 98.6 },
        { day: 'Fri', temp: 98.5 },
        { day: 'Sat', temp: 98.7 },
        { day: 'Sun', temp: 98.6 },
    ];

    // Recent readings
    const readings = [
        { time: 'Today, 8:00 AM', value: 98.6, status: 'Normal' },
        { time: 'Yesterday, 8:00 PM', value: 99.1, status: 'Slightly High' },
        { time: 'Yesterday, 8:00 AM', value: 98.4, status: 'Normal' },
    ];

    const getStatus = (temp) => {
        if (unit === 'F') {
            if (temp < 97.8) return { text: 'Low', color: '#3498DB', icon: 'snow' };
            if (temp > 99.5) return { text: 'Fever', color: '#E74C3C', icon: 'flame' };
            if (temp > 99.1) return { text: 'Elevated', color: '#F59E0B', icon: 'trending-up' };
            return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
        } else {
            if (temp < 36.5) return { text: 'Low', color: '#3498DB', icon: 'snow' };
            if (temp > 37.8) return { text: 'Fever', color: '#E74C3C', icon: 'flame' };
            if (temp > 37.3) return { text: 'Elevated', color: '#F59E0B', icon: 'trending-up' };
            return { text: 'Normal', color: '#27AE60', icon: 'checkmark-circle' };
        }
    };

    const status = getStatus(currentTemp);

    useEffect(() => {
        startAnimations();
    }, [unit]);

    const startAnimations = () => {
        const fillHeight = unit === 'F'
            ? ((currentTemp - 96) / 8) * 100
            : ((currentTemp - 35) / 5) * 100;

        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        thermometerAnim.setValue(0);

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
            Animated.timing(thermometerAnim, {
                toValue: Math.min(fillHeight, 100),
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Chart animations with stagger
        chartAnims.forEach((anim, index) => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: 400 + index * 60,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
            }).start();
        });

        // Card animations with stagger
        cardAnims.forEach((anim, index) => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 800 + index * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        });
    };

    // Modern Thermometer Display
    const ThermometerDisplay = () => {
        const fillHeight = thermometerAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
        });

        return (
            <Animated.View style={[styles.tempDisplayContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.thermometerCard}>
                    {/* Thermometer Visual */}
                    <View style={styles.thermometerWrapper}>
                        <View style={styles.thermometerBody}>
                            <View style={styles.thermometerTrack}>
                                <Animated.View
                                    style={[
                                        styles.thermometerFill,
                                        {
                                            height: fillHeight,
                                            backgroundColor: status.color,
                                        }
                                    ]}
                                />
                            </View>
                            <View style={[styles.thermometerBulb, { backgroundColor: status.color }]}>
                                <Ionicons name="thermometer" size={scale(20)} color="#FFFFFF" />
                            </View>
                        </View>
                        {/* Scale markers */}
                        <View style={styles.scaleMarkers}>
                            <Text style={styles.scaleText}>{unit === 'F' ? '104°' : '40°'}</Text>
                            <Text style={styles.scaleText}>{unit === 'F' ? '100°' : '38°'}</Text>
                            <Text style={styles.scaleText}>{unit === 'F' ? '96°' : '36°'}</Text>
                        </View>
                    </View>

                    {/* Temperature Value */}
                    <View style={styles.tempValueContainer}>
                        <Text style={[styles.tempValue, { color: status.color }]}>
                            {currentTemp}°{unit}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                            <Ionicons name={status.icon} size={moderateScale(14)} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                        </View>
                    </View>
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
        const minTemp = 97;
        const maxTemp = 101;

        return (
            <View style={styles.chartContainer}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(35)}>
                    <Defs>
                        <LinearGradient id="tempBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryLight} />
                        </LinearGradient>
                        <LinearGradient id="tempBarActive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primaryDark} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.map((item, index) => {
                        const barHeight = ((item.temp - minTemp) / (maxTemp - minTemp)) * chartHeight;
                        const x = scale(20) + index * (barWidth + spacing);
                        const isToday = index === weeklyData.length - 1;
                        const tempStatus = getStatus(item.temp);

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
                                    fill="#E0F7FA"
                                />
                                <AnimatedRect
                                    x={x}
                                    y={animatedY}
                                    width={barWidth}
                                    height={animatedHeight}
                                    rx={scale(8)}
                                    fill={isToday ? "url(#tempBarActive)" : tempStatus.color}
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
                    <Text style={styles.headerTitle}>Temperature</Text>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="calendar-outline" size={moderateScale(22)} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Unit Toggle */}
                    <View style={styles.unitContainer}>
                        <View style={styles.unitToggle}>
                            <TouchableOpacity
                                style={[styles.unitButton, unit === 'F' && styles.unitButtonActive]}
                                onPress={() => setUnit('F')}
                            >
                                <Text style={[styles.unitText, unit === 'F' && styles.unitTextActive]}>°F</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitButton, unit === 'C' && styles.unitButtonActive]}
                                onPress={() => setUnit('C')}
                            >
                                <Text style={[styles.unitText, unit === 'C' && styles.unitTextActive]}>°C</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Thermometer Display */}
                    <ThermometerDisplay />

                    {/* Normal Range Card */}
                    <View style={styles.rangeCard}>
                        <View style={styles.rangeIcon}>
                            <Ionicons name="shield-checkmark" size={scale(24)} color="#27AE60" />
                        </View>
                        <View style={styles.rangeContent}>
                            <Text style={styles.rangeLabel}>Normal Range</Text>
                            <Text style={styles.rangeValue}>{normalRange}</Text>
                        </View>
                    </View>

                    {/* Measure Button */}
                    <TouchableOpacity style={styles.measureButton} activeOpacity={0.8}>
                        <Ionicons name="thermometer" size={scale(22)} color="#FFFFFF" />
                        <Text style={styles.measureButtonText}>Measure Temperature</Text>
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

                    {/* Recent Readings */}
                    <Text style={styles.sectionTitleFull}>Recent Readings</Text>
                    <View style={styles.readingsList}>
                        {readings.map((reading, index) => {
                            const readingStatus = getStatus(reading.value);
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
                                            <View style={[styles.readingDot, { backgroundColor: readingStatus.color }]} />
                                            <View>
                                                <Text style={styles.readingTime}>{reading.time}</Text>
                                                <View style={[styles.readingStatusBadge, { backgroundColor: `${readingStatus.color}15` }]}>
                                                    <Text style={[styles.readingStatusText, { color: readingStatus.color }]}>
                                                        {reading.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={[styles.readingValue, { color: readingStatus.color }]}>
                                            {reading.value}°F
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

export default TemperatureScreen;

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
    unitContainer: {
        alignItems: 'center',
        paddingTop: hp(2),
    },
    unitToggle: {
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
    unitButton: {
        paddingHorizontal: wp(8),
        paddingVertical: hp(1.2),
        borderRadius: scale(10),
    },
    unitButtonActive: {
        backgroundColor: THEME.primary,
    },
    unitText: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: THEME.textSecondary,
    },
    unitTextActive: {
        color: '#FFFFFF',
    },
    tempDisplayContainer: {
        paddingHorizontal: wp(5),
        paddingVertical: hp(3),
    },
    thermometerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(24),
        padding: scale(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    thermometerWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginRight: scale(30),
    },
    thermometerBody: {
        alignItems: 'center',
    },
    thermometerTrack: {
        width: scale(24),
        height: scale(120),
        backgroundColor: '#E0F7FA',
        borderRadius: scale(12),
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    thermometerFill: {
        width: '100%',
        borderRadius: scale(12),
    },
    thermometerBulb: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -scale(8),
    },
    scaleMarkers: {
        justifyContent: 'space-between',
        height: scale(120),
        marginLeft: scale(8),
    },
    scaleText: {
        fontSize: moderateScale(10),
        color: THEME.textSecondary,
    },
    tempValueContainer: {
        alignItems: 'flex-start',
    },
    tempValue: {
        fontSize: moderateScale(48),
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(1),
        gap: scale(6),
    },
    statusText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    rangeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
    },
    rangeIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: '#C8E6C9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rangeContent: {
        marginLeft: scale(14),
    },
    rangeLabel: {
        fontSize: moderateScale(13),
        color: '#2E7D32',
    },
    rangeValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1B5E20',
        marginTop: verticalScale(2),
    },
    measureButton: {
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
        fontSize: moderateScale(24),
        fontWeight: '700',
    },
});
