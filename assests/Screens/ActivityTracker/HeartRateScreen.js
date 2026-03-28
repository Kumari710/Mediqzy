import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G, Rect, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { healthConnectService } from '../../Utils/healthConnectService';
import {
    getDailyActivity,
    getHeartRateHistory,
    getActivityGoals,
    addHeartRateReading,
} from '../../Utils/firebaseActivityStorage';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');

// Theme colors for Heart Rate
const THEME = {
    primary: '#9B59B6',
    primaryDark: '#8E44AD',
    primaryLight: '#D6BCFA',
    secondary: '#E74C3C',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const HeartRateScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [currentBPM, setCurrentBPM] = useState(0);

    // Animation Values
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const periods = ['Day', 'Week', 'Month'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handleSyncHealthConnect = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date();

            const hrRecords = await healthConnectService.getHeartRate(startTime.toISOString(), endTime.toISOString());

            if (hrRecords.length > 0) {
                const latestRecord = hrRecords[hrRecords.length - 1];
                if (latestRecord.samples && latestRecord.samples.length > 0) {
                    const latestSample = latestRecord.samples[latestRecord.samples.length - 1];
                    await addHeartRateReading(latestSample.beatsPerMinute);
                    await loadData();
                    if (!isSilent) alert(`Synced heart rate: ${latestSample.beatsPerMinute} BPM`);
                }
            } else if (!isSilent) {
                alert('No heart rate data found in Health Connect.');
            }
        } catch (error) {
            console.error('Sync Error:', error);
            if (!isSilent) alert('Failed to sync with Health Connect');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const loadData = useCallback(async (shouldSync = false) => {
        try {
            if (shouldSync) {
                await handleSyncHealthConnect(true);
            }

            const daily = await getDailyActivity();
            const history = await getHeartRateHistory(7);

            setTodayData(daily);
            setHistoryData(history);

            const bpm = daily?.currentHeartRate || daily?.avgHeartRate || 72;
            setCurrentBPM(bpm);

            // Animate progress
            animateProgress(bpm);
        } catch (error) {
            console.error('Error loading heart rate data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    const animateProgress = (bpm) => {
        // Progress based on heart rate zone (50-180 BPM range)
        const percentage = Math.min(((bpm - 40) / 140) * 100, 100);

        progressAnim.setValue(0);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: percentage,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Pulse animation
        startPulseAnimation();
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        loadData(true);
    }, [selectedPeriod]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData(true);
        });
        return unsubscribe;
    }, [navigation, loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(true);
    }, [loadData]);

    const getHeartRateZone = (bpm) => {
        if (bpm < 60) return { zone: 'Resting', color: '#3498DB', icon: 'bed' };
        if (bpm < 100) return { zone: 'Normal', color: '#27AE60', icon: 'heart' };
        if (bpm < 140) return { zone: 'Cardio', color: '#F39C12', icon: 'fitness' };
        return { zone: 'Peak', color: '#E74C3C', icon: 'flash' };
    };

    const zoneInfo = getHeartRateZone(currentBPM);

    // Circular Progress with Heart Icon
    const HeartRateGauge = ({ size = scale(200), strokeWidth = scale(16) }) => {
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
                            stroke="#F3F4F6"
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
                        <Ionicons name="heart" size={moderateScale(36)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={styles.bpmValue}>{currentBPM}</Text>
                    <Text style={styles.bpmLabel}>BPM</Text>
                </View>
            </Animated.View>
        );
    };

    // Heart Rate Chart
    const HeartRateChart = () => {
        if (historyData.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Ionicons name="pulse-outline" size={40} color="#CBD5E1" />
                    <Text style={styles.noDataText}>No heart rate data available</Text>
                </View>
            );
        }

        const chartHeight = scale(100);
        const chartWidth = width - scale(80);
        const data = historyData.slice(-7);
        const maxBPM = Math.max(...data.map(d => d.avgBpm || d.maxBpm || 100), 120);
        const minBPM = Math.min(...data.map(d => d.minBpm || d.avgBpm || 60), 50);

        // Generate path for line chart
        const points = data.map((item, index) => {
            const x = (index / (data.length - 1 || 1)) * chartWidth + scale(40);
            const y = chartHeight - ((item.avgBpm || 72) - minBPM) / (maxBPM - minBPM) * chartHeight + scale(10);
            return `${x},${y}`;
        });

        const pathData = `M ${points.join(' L ')}`;

        return (
            <View style={styles.chartWrapper}>
                <Svg width={width - scale(40)} height={chartHeight + scale(50)}>
                    <Defs>
                        <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={THEME.primaryLight} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>

                    {/* Grid lines */}
                    {[0, 0.5, 1].map((ratio, i) => (
                        <G key={i}>
                            <Rect
                                x={scale(40)}
                                y={scale(10) + ratio * chartHeight}
                                width={chartWidth}
                                height={1}
                                fill="#E2E8F0"
                            />
                            <SvgText
                                x={scale(30)}
                                y={scale(15) + ratio * chartHeight}
                                fontSize={scale(10)}
                                fill="#94A3B8"
                                textAnchor="end"
                            >
                                {Math.round(maxBPM - ratio * (maxBPM - minBPM))}
                            </SvgText>
                        </G>
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

                    {/* Data points */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1 || 1)) * chartWidth + scale(40);
                        const y = chartHeight - ((item.avgBpm || 72) - minBPM) / (maxBPM - minBPM) * chartHeight + scale(10);
                        const date = new Date(item.date);

                        return (
                            <G key={index}>
                                <Circle
                                    cx={x}
                                    cy={y}
                                    r={scale(5)}
                                    fill={THEME.primary}
                                />
                                <Circle
                                    cx={x}
                                    cy={y}
                                    r={scale(3)}
                                    fill="#FFFFFF"
                                />
                                <SvgText
                                    x={x}
                                    y={chartHeight + scale(35)}
                                    fontSize={scale(10)}
                                    fill="#64748B"
                                    textAnchor="middle"
                                >
                                    {dayNames[date.getDay()]}
                                </SvgText>
                            </G>
                        );
                    })}
                </Svg>
            </View>
        );
    };

    // Heart Rate Zones
    const zones = [
        { name: 'Resting', range: '< 60', color: '#3498DB', icon: 'bed' },
        { name: 'Normal', range: '60-100', color: '#27AE60', icon: 'heart' },
        { name: 'Cardio', range: '100-140', color: '#F39C12', icon: 'fitness' },
        { name: 'Peak', range: '> 140', color: '#E74C3C', icon: 'flash' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>Loading heart rate data...</Text>
            </SafeAreaView>
        );
    }

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
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleSyncHealthConnect} style={styles.syncButton}>
                            <Ionicons name="sync-outline" size={moderateScale(22)} color={THEME.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <Ionicons name="ellipsis-vertical" size={moderateScale(22)} color="#1E3A8A" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[THEME.primary]}
                            tintColor={THEME.primary}
                        />
                    }
                >
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

                    {/* Heart Rate Gauge */}
                    <View style={styles.gaugeSection}>
                        <HeartRateGauge />
                        <View style={[styles.zoneBadge, { backgroundColor: `${zoneInfo.color}20` }]}>
                            <Ionicons name={zoneInfo.icon} size={moderateScale(16)} color={zoneInfo.color} />
                            <Text style={[styles.zoneText, { color: zoneInfo.color }]}>{zoneInfo.zone} Zone</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#FFEBEB' }]}>
                            <Ionicons name="arrow-up" size={scale(18)} color="#E74C3C" />
                            <Text style={styles.statValue}>{todayData?.maxHeartRate || currentBPM + 20}</Text>
                            <Text style={styles.statLabel}>Max BPM</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E4FFE4' }]}>
                            <Ionicons name="remove" size={scale(18)} color="#27AE60" />
                            <Text style={styles.statValue}>{todayData?.avgHeartRate || currentBPM}</Text>
                            <Text style={styles.statLabel}>Avg BPM</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="arrow-down" size={scale(18)} color="#3498DB" />
                            <Text style={styles.statValue}>{todayData?.minHeartRate || currentBPM - 15}</Text>
                            <Text style={styles.statLabel}>Min BPM</Text>
                        </View>
                    </View>

                    {/* Chart Section */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Weekly Trend</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <HeartRateChart />
                    </View>

                    {/* Heart Rate Zones */}
                    <Text style={styles.sectionTitleFull}>Heart Rate Zones</Text>
                    <View style={styles.zonesContainer}>
                        {zones.map((zone, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.zoneCard,
                                    zoneInfo.zone === zone.name && styles.zoneCardActive
                                ]}
                            >
                                <View style={[styles.zoneIcon, { backgroundColor: `${zone.color}20` }]}>
                                    <Ionicons name={zone.icon} size={scale(20)} color={zone.color} />
                                </View>
                                <View style={styles.zoneInfo}>
                                    <Text style={styles.zoneName}>{zone.name}</Text>
                                    <Text style={styles.zoneRange}>{zone.range} BPM</Text>
                                </View>
                                {zoneInfo.zone === zone.name && (
                                    <View style={[styles.currentIndicator, { backgroundColor: zone.color }]}>
                                        <Text style={styles.currentText}>Current</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Add Reading Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddActivityScreen', { type: 'heartRate' })}
                    >
                        <Ionicons name="add-circle" size={scale(24)} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add Heart Rate Reading</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default HeartRateScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.surface,
    },
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncButton: {
        padding: scale(8),
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
    gaugeSection: {
        alignItems: 'center',
        paddingVertical: hp(4),
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
        paddingVertical: hp(1),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    zoneText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    statCard: {
        borderRadius: scale(16),
        padding: scale(16),
        alignItems: 'center',
        width: '31%',
    },
    statValue: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: THEME.text,
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
        padding: scale(20),
        marginBottom: hp(3),
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
        marginBottom: hp(2),
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
        marginBottom: hp(2),
    },
    seeMore: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.primary,
    },
    chartWrapper: {
        alignItems: 'center',
    },
    noDataContainer: {
        height: scale(120),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: moderateScale(14),
        color: '#94A3B8',
        marginTop: verticalScale(8),
    },
    zonesContainer: {
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    zoneCard: {
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
    zoneCardActive: {
        borderWidth: 2,
        borderColor: THEME.primary,
    },
    zoneIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoneInfo: {
        flex: 1,
        marginLeft: scale(14),
    },
    zoneName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: THEME.text,
    },
    zoneRange: {
        fontSize: moderateScale(13),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    currentIndicator: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(12),
    },
    currentText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.primary,
        marginHorizontal: wp(5),
        paddingVertical: hp(1.8),
        borderRadius: scale(14),
        gap: scale(8),
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
