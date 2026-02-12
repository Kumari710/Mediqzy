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
    getStepsHistory,
    getActivityGoals,
    calculateStats,
    updateSteps,
} from '../../Utils/firebaseActivityStorage';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width } = Dimensions.get('window');

// Theme colors for Step Tracker
const THEME = {
    primary: '#FFB800',
    primaryDark: '#FF9500',
    primaryLight: '#FFE082',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const StepTrackerScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({ avg: 0, best: 0, total: 0 });
    const [goals, setGoals] = useState({ steps: 10000 });

    // Animation Values
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;

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
            const startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date();
            const stepsData = await healthConnectService.getSteps(startTime.toISOString(), endTime.toISOString());
            const totalSteps = stepsData.reduce((sum, record) => sum + (record.count || 0), 0);

            if (totalSteps > 0) {
                await updateSteps(totalSteps);
                await loadData();
                if (!isSilent) alert(`Synced ${totalSteps} steps from your watch/Health Connect!`);
            } else if (!isSilent) {
                alert('No steps found in Health Connect for today.');
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
            const history = await getStepsHistory(days);

            setTodayData(daily);
            setGoals(activityGoals);
            setHistoryData(history);

            const calculatedStats = calculateStats(history, 'steps');
            setStats(calculatedStats);

            // Trigger animations
            animateProgress(daily?.steps || 0, activityGoals.steps || 10000);
        } catch (error) {
            console.error('Error loading step data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    const animateProgress = (currentSteps, goalSteps) => {
        const percentage = goalSteps > 0 ? (currentSteps / goalSteps) * 100 : 0;

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
                toValue: Math.min(percentage, 100),
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        // Animate bars with stagger
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

    const currentSteps = todayData?.steps || 0;
    const goalSteps = goals.steps || 10000;
    const progressPercentage = goalSteps > 0 ? (currentSteps / goalSteps) * 100 : 0;

    const getChartData = () => {
        if (selectedPeriod === 'Day') {
            return [{ day: 'Today', steps: currentSteps, goal: goalSteps }];
        }
        return historyData.slice(-7).map((item) => {
            const date = new Date(item.date);
            return {
                day: dayNames[date.getDay()],
                steps: item.steps,
                goal: item.goal || goalSteps,
            };
        });
    };

    const weeklyData = getChartData();

    const getPeriodData = () => {
        return {
            steps: currentSteps,
            goal: goalSteps,
            avg: stats.avg.toLocaleString(),
            best: stats.best.toLocaleString(),
            total: stats.total.toLocaleString(),
            kcal: todayData?.caloriesBurned || Math.round(currentSteps * 0.04),
            km: todayData?.distance?.toFixed(1) || (currentSteps * 0.762 / 1000).toFixed(1),
            min: todayData?.activeMinutes || Math.round(stats.avg / 100),
        };
    };

    const currentData = getPeriodData();

    // Beautiful Circular Progress with Gradient
    const CircularProgress = ({ size = scale(200), strokeWidth = scale(16) }) => {
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
                        <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FFD54F" />
                            <Stop offset="50%" stopColor="#FFB800" />
                            <Stop offset="100%" stopColor="#FF9500" />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Background Circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F3F4F6"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                {/* Center Content */}
                <View style={styles.progressContent}>
                    <Ionicons name="footsteps" size={moderateScale(28)} color={THEME.primary} />
                    <Text style={styles.progressValue}>{currentSteps.toLocaleString()}</Text>
                    <Text style={styles.progressGoal}>of {goalSteps.toLocaleString()}</Text>
                </View>
            </Animated.View>
        );
    };

    // Animated Bar Chart
    const BarChart = () => {
        if (weeklyData.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Ionicons name="bar-chart-outline" size={40} color="#CBD5E1" />
                    <Text style={styles.noDataText}>No step data available</Text>
                </View>
            );
        }

        const maxSteps = Math.max(...weeklyData.map(d => d.steps), 1);
        const chartHeight = scale(120);
        const barWidth = scale(32);
        const numBars = Math.min(weeklyData.length, 7);
        const totalWidth = width - scale(80);
        const spacing = (totalWidth - barWidth * numBars) / Math.max(numBars - 1, 1);

        return (
            <View style={styles.chartWrapper}>
                <Svg width={totalWidth + scale(40)} height={chartHeight + scale(40)}>
                    <Defs>
                        <LinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#FFB800" />
                            <Stop offset="100%" stopColor="#FFD54F" />
                        </LinearGradient>
                        <LinearGradient id="barGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#FF9500" />
                            <Stop offset="100%" stopColor="#FFB800" />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.slice(-7).map((item, index) => {
                        const barHeight = maxSteps > 0 ? (item.steps / maxSteps) * chartHeight : 0;
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
                                {/* Bar background */}
                                <Rect
                                    x={x}
                                    y={scale(10)}
                                    width={barWidth}
                                    height={chartHeight}
                                    rx={scale(8)}
                                    fill="#F1F5F9"
                                />
                                {/* Bar value */}
                                <AnimatedRect
                                    x={x}
                                    y={animatedY}
                                    width={barWidth}
                                    height={animatedHeight}
                                    rx={scale(8)}
                                    fill={isToday ? "url(#barGradientActive)" : "url(#barGradient)"}
                                />
                                {/* Day label */}
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
                <Text style={styles.loadingText}>Loading step data...</Text>
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
                    <Text style={styles.headerTitle}>Step Tracking</Text>
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

                    {/* Circular Progress */}
                    <View style={styles.progressContainer}>
                        <CircularProgress />
                        {progressPercentage >= 100 && (
                            <View style={styles.achievedBadge}>
                                <Ionicons name="trophy" size={moderateScale(16)} color="#FFB800" />
                                <Text style={styles.achievedText}>Goal Achieved!</Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFEBEB' }]}>
                                <Ionicons name="flame" size={scale(20)} color="#E74C3C" />
                            </View>
                            <Text style={styles.statItemValue}>{currentData.kcal}</Text>
                            <Text style={styles.statItemLabel}>kcal</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#E8F4FD' }]}>
                                <Ionicons name="navigate" size={scale(20)} color="#3498DB" />
                            </View>
                            <Text style={styles.statItemValue}>{currentData.km}</Text>
                            <Text style={styles.statItemLabel}>km</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: '#E4FFE4' }]}>
                                <Ionicons name="time" size={scale(20)} color="#27AE60" />
                            </View>
                            <Text style={styles.statItemValue}>{currentData.min}</Text>
                            <Text style={styles.statItemLabel}>min</Text>
                        </View>
                    </View>

                    {/* Chart Section */}
                    <View style={styles.chartSection}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>
                                {selectedPeriod === 'Day' ? "Today's Progress" : `${selectedPeriod}ly Overview`}
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.seeMore}>Details</Text>
                            </TouchableOpacity>
                        </View>
                        <BarChart />
                    </View>

                    {/* Statistics Cards */}
                    <View style={styles.statsCards}>
                        <View style={[styles.statsCard, { backgroundColor: '#FFF8E7' }]}>
                            <Ionicons name="trending-up" size={scale(20)} color={THEME.primary} />
                            <Text style={styles.statsCardLabel}>Average</Text>
                            <Text style={styles.statsCardValue}>{currentData.avg}</Text>
                            <Text style={styles.statsCardUnit}>steps/day</Text>
                        </View>
                        <View style={[styles.statsCard, { backgroundColor: '#E4FFE4' }]}>
                            <Ionicons name="trophy" size={scale(20)} color="#27AE60" />
                            <Text style={styles.statsCardLabel}>Best Day</Text>
                            <Text style={styles.statsCardValue}>{currentData.best}</Text>
                            <Text style={styles.statsCardUnit}>steps</Text>
                        </View>
                        <View style={[styles.statsCard, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="stats-chart" size={scale(20)} color="#3498DB" />
                            <Text style={styles.statsCardLabel}>Total</Text>
                            <Text style={styles.statsCardValue}>{currentData.total}</Text>
                            <Text style={styles.statsCardUnit}>steps</Text>
                        </View>
                    </View>

                    {/* Add Steps Button */}
                    <TouchableOpacity
                        style={styles.addStepsButton}
                        onPress={() => navigation.navigate('AddActivityScreen', { type: 'steps' })}
                    >
                        <Ionicons name="add-circle" size={scale(24)} color="#FFFFFF" />
                        <Text style={styles.addStepsText}>Add Steps Manually</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default StepTrackerScreen;

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
    progressContainer: {
        alignItems: 'center',
        paddingVertical: hp(4),
    },
    progressContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    progressValue: {
        fontSize: moderateScale(36),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(4),
    },
    progressGoal: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    achievedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    achievedText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#B45309',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    statItemValue: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: THEME.text,
    },
    statItemLabel: {
        fontSize: moderateScale(12),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
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
    statsCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    statsCard: {
        borderRadius: scale(16),
        padding: scale(16),
        width: '31%',
        alignItems: 'center',
    },
    statsCardLabel: {
        fontSize: moderateScale(11),
        color: THEME.textSecondary,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(4),
    },
    statsCardValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
    },
    statsCardUnit: {
        fontSize: moderateScale(10),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    addStepsButton: {
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
    addStepsText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
