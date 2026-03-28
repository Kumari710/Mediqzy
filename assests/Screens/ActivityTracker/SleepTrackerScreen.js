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
import Svg, { Circle, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { healthConnectService } from '../../Utils/healthConnectService';
import {
    getDailyActivity,
    getSleepHistory,
    getActivityGoals,
    calculateStats,
    saveSleepData,
} from '../../Utils/firebaseActivityStorage';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width } = Dimensions.get('window');

// Theme colors for Sleep Tracker (Cyan/Teal)
const THEME = {
    primary: '#00BFA5',
    primaryDark: '#00897B',
    primaryLight: '#A7FFEB',
    secondary: '#1E3A8A',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const SleepTrackerScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const [viewMode, setViewMode] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({ avg: 0, best: 0, total: 0 });
    const [goals, setGoals] = useState({ sleep: 8 });

    // Animation values
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const moonAnim = useRef(new Animated.Value(0)).current;

    const periods = ['Day', 'Week', 'Month'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysForPeriod = (period) => {
        switch (period) {
            case 'Day': return 1;
            case 'Week': return 7;
            case 'Month': return 30;
            default: return 7;
        }
    };

    const handleSyncHealthConnect = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const endTime = new Date();
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);

            const sleepRecords = await healthConnectService.getSleep(startTime.toISOString(), endTime.toISOString());

            if (sleepRecords.length > 0) {
                const latestSleep = sleepRecords[sleepRecords.length - 1];
                const start = new Date(latestSleep.startTime);
                const end = new Date(latestSleep.endTime);
                const durationHours = (end - start) / (1000 * 60 * 60);

                if (durationHours > 0) {
                    await saveSleepData({
                        total: parseFloat(durationHours.toFixed(1)),
                        quality: 85,
                        bedtime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        wakeTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    });
                    await loadData();
                    if (!isSilent) alert(`Synced ${durationHours.toFixed(1)} hours of sleep!`);
                }
            } else if (!isSilent) {
                alert('No sleep records found in Health Connect.');
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
            const activityGoals = await getActivityGoals();
            const days = getDaysForPeriod(selectedPeriod);
            const history = await getSleepHistory(days);

            setTodayData(daily);
            setGoals(activityGoals);
            setHistoryData(history);

            const calculatedStats = calculateStats(history, 'total');
            setStats(calculatedStats);

            animateProgress(daily?.sleepHours || 0, activityGoals.sleep || 8);
        } catch (error) {
            console.error('Error loading sleep data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    const animateProgress = (sleepTotal, goalSleep) => {
        const percentage = goalSleep > 0 ? (sleepTotal / goalSleep) * 100 : 0;

        progressAnim.setValue(0);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        moonAnim.setValue(0);

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
                toValue: Math.min(percentage, 100),
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(moonAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]).start();

        chartAnims.forEach((anim, i) => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 600,
                delay: i * 80,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: false,
            }).start();
        });
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

    const sleepData = {
        total: todayData?.sleepHours || 0,
        goal: goals.sleep || 8,
        quality: todayData?.sleepQuality || 85,
        deep: todayData?.deepSleep || 1.5,
        light: todayData?.lightSleep || 3.5,
        rem: todayData?.remSleep || 1.8,
        awake: todayData?.awakeTime || 0.5,
        bedtime: todayData?.bedtime || '11:00 PM',
        wakeTime: todayData?.wakeTime || '7:00 AM',
    };

    const progressPercentage = sleepData.goal > 0 ? (sleepData.total / sleepData.goal) * 100 : 0;

    const getChartData = () => {
        if (selectedPeriod === 'Day') {
            return [{ day: 'Today', hours: sleepData.total }];
        }
        return historyData.slice(-7).map((item) => {
            const date = new Date(item.date);
            return {
                day: dayNames[date.getDay()],
                hours: item.total || 0,
            };
        });
    };

    const weeklyData = getChartData();

    // Sleep phases data
    const sleepPhases = [
        { label: 'Deep', value: sleepData.deep, color: THEME.secondary, percentage: (sleepData.deep / sleepData.total * 100) || 0 },
        { label: 'Light', value: sleepData.light, color: '#60A5FA', percentage: (sleepData.light / sleepData.total * 100) || 0 },
        { label: 'REM', value: sleepData.rem, color: '#A78BFA', percentage: (sleepData.rem / sleepData.total * 100) || 0 },
        { label: 'Awake', value: sleepData.awake, color: '#F59E0B', percentage: (sleepData.awake / sleepData.total * 100) || 0 },
    ];

    // Sleep Gauge Component
    const SleepGauge = ({ size = scale(200), strokeWidth = scale(16) }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;

        const strokeDashoffset = progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
        });

        const moonScale = moonAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
        });

        return (
            <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                            stroke="url(#sleepGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Animated.View style={{ transform: [{ scale: moonScale }] }}>
                        <Ionicons name="moon" size={moderateScale(32)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={styles.sleepValue}>{sleepData.total}h</Text>
                    <Text style={styles.sleepLabel}>of {sleepData.goal}h goal</Text>
                </View>
            </Animated.View>
        );
    };

    // Bar Chart
    const BarChart = () => {
        if (weeklyData.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Ionicons name="bar-chart-outline" size={40} color="#CBD5E1" />
                    <Text style={styles.noDataText}>No sleep data available</Text>
                </View>
            );
        }

        const maxHours = 10;
        const chartHeight = scale(100);
        const barWidth = scale(32);
        const numBars = Math.min(weeklyData.length, 7);
        const totalWidth = width - scale(80);
        const spacing = (totalWidth - barWidth * numBars) / Math.max(numBars - 1, 1);

        return (
            <View style={styles.chartWrapper}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(40)}>
                    <Defs>
                        <LinearGradient id="sleepBarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryLight} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.map((item, index) => {
                        const barHeight = (item.hours / maxHours) * chartHeight;
                        const x = scale(20) + index * (barWidth + spacing);
                        const isToday = index === weeklyData.length - 1;

                        const animValue = chartAnims[index] || new Animated.Value(1);
                        const animatedHeight = animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, barHeight],
                        });
                        const animatedY = animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [scale(10) + chartHeight, scale(10) + (chartHeight - barHeight)],
                        });

                        return (
                            <G key={index}>
                                <Rect
                                    x={x}
                                    y={scale(10)}
                                    width={barWidth}
                                    height={chartHeight}
                                    rx={scale(8)}
                                    fill="#E0F7F4"
                                />
                                <AnimatedRect
                                    x={x}
                                    y={animatedY}
                                    width={barWidth}
                                    height={animatedHeight}
                                    rx={scale(8)}
                                    fill={isToday ? THEME.primaryDark : "url(#sleepBarGradient)"}
                                />
                                <SvgText
                                    x={x + barWidth / 2}
                                    y={chartHeight + scale(28)}
                                    fontSize={scale(11)}
                                    fill="#64748B"
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

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>Loading sleep data...</Text>
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
                    <Text style={styles.headerTitle}>Sleep Tracking</Text>
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

                    {/* Sleep Gauge */}
                    <View style={styles.gaugeSection}>
                        <SleepGauge />
                        <View style={styles.qualityBadge}>
                            <Ionicons name="star" size={moderateScale(14)} color={THEME.primary} />
                            <Text style={styles.qualityText}>Sleep Quality: {sleepData.quality}%</Text>
                        </View>
                        {progressPercentage >= 100 && (
                            <View style={styles.achievedBadge}>
                                <Text style={styles.achievedText}>🌙 Sleep Goal Met!</Text>
                            </View>
                        )}
                    </View>

                    {/* Sleep Schedule */}
                    <View style={styles.scheduleCard}>
                        <View style={styles.scheduleItem}>
                            <View style={[styles.scheduleIcon, { backgroundColor: '#E0F7F4' }]}>
                                <Ionicons name="moon-outline" size={scale(20)} color={THEME.primary} />
                            </View>
                            <View>
                                <Text style={styles.scheduleLabel}>Bedtime</Text>
                                <Text style={styles.scheduleTime}>{sleepData.bedtime}</Text>
                            </View>
                        </View>
                        <View style={styles.scheduleDivider} />
                        <View style={styles.scheduleItem}>
                            <View style={[styles.scheduleIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="sunny-outline" size={scale(20)} color="#F59E0B" />
                            </View>
                            <View>
                                <Text style={styles.scheduleLabel}>Wake up</Text>
                                <Text style={styles.scheduleTime}>{sleepData.wakeTime}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Sleep Phases */}
                    <Text style={styles.sectionTitle}>Sleep Phases</Text>
                    <View style={styles.phasesContainer}>
                        {sleepPhases.map((phase, index) => (
                            <View key={index} style={styles.phaseCard}>
                                <View style={[styles.phaseIndicator, { backgroundColor: phase.color }]} />
                                <View style={styles.phaseInfo}>
                                    <Text style={styles.phaseLabel}>{phase.label}</Text>
                                    <Text style={styles.phaseValue}>{phase.value.toFixed(1)}h</Text>
                                </View>
                                <Text style={styles.phasePercent}>{phase.percentage.toFixed(0)}%</Text>
                            </View>
                        ))}
                    </View>

                    {/* Chart Section */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>
                                {selectedPeriod === 'Day' ? "Tonight's Sleep" : `${selectedPeriod}ly Overview`}
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <BarChart />
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#E0F7F4' }]}>
                            <Ionicons name="trending-up" size={scale(20)} color={THEME.primary} />
                            <Text style={styles.statValue}>{stats.avg.toFixed(1)}h</Text>
                            <Text style={styles.statLabel}>Average</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E4FFE4' }]}>
                            <Ionicons name="trophy" size={scale(20)} color="#27AE60" />
                            <Text style={styles.statValue}>{stats.best.toFixed(1)}h</Text>
                            <Text style={styles.statLabel}>Best Night</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="moon" size={scale(20)} color="#9B59B6" />
                            <Text style={styles.statValue}>{sleepData.quality}%</Text>
                            <Text style={styles.statLabel}>Quality</Text>
                        </View>
                    </View>

                    {/* Add Sleep Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddActivityScreen', { type: 'sleep' })}
                    >
                        <Ionicons name="add-circle" size={scale(24)} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Log Sleep Manually</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default SleepTrackerScreen;

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
    sleepValue: {
        fontSize: moderateScale(40),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(4),
    },
    sleepLabel: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    qualityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F7F4',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    qualityText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: THEME.primaryDark,
    },
    achievedBadge: {
        marginTop: hp(1),
    },
    achievedText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.primary,
    },
    scheduleCard: {
        flexDirection: 'row',
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(2),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    scheduleItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    scheduleIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    scheduleLabel: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
    },
    scheduleTime: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(2),
    },
    scheduleDivider: {
        width: 1,
        height: scale(40),
        backgroundColor: '#E2E8F0',
        marginHorizontal: scale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        paddingHorizontal: wp(5),
        marginBottom: hp(1.5),
    },
    phasesContainer: {
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    phaseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.background,
        borderRadius: scale(12),
        padding: scale(14),
        marginBottom: verticalScale(8),
    },
    phaseIndicator: {
        width: scale(4),
        height: scale(36),
        borderRadius: scale(2),
        marginRight: scale(14),
    },
    phaseInfo: {
        flex: 1,
    },
    phaseLabel: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
    },
    phaseValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(2),
    },
    phasePercent: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.textSecondary,
    },
    chartSection: {
        backgroundColor: THEME.background,
        marginHorizontal: wp(5),
        borderRadius: scale(20),
        padding: scale(20),
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
        marginBottom: hp(2),
    },
    chartTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: THEME.text,
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
        height: scale(100),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: moderateScale(14),
        color: '#94A3B8',
        marginTop: verticalScale(8),
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
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(6),
    },
    statLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginTop: verticalScale(4),
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
