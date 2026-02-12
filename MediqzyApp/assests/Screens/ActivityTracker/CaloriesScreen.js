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
    getCaloriesHistory,
    getActivityGoals,
    calculateStats,
    updateCalories,
} from '../../Utils/firebaseActivityStorage';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width } = Dimensions.get('window');

// Theme colors for Calories
const THEME = {
    primary: '#FF6B35',
    primaryDark: '#E85A24',
    primaryLight: '#FFB088',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
};

const CaloriesScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({ avg: 0, best: 0, total: 0 });
    const [goals, setGoals] = useState({ calories: 2000 });

    // Animation Values
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const chartAnims = useRef(new Array(7).fill(0).map(() => new Animated.Value(0))).current;
    const fireAnim = useRef(new Animated.Value(1)).current;

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

            const caloriesRecords = await healthConnectService.getCalories(startTime.toISOString(), endTime.toISOString());
            const totalCal = caloriesRecords.reduce((sum, r) => sum + (r.energy?.inKilocalories || r.energy?.inCalories / 1000 || 0), 0);

            if (totalCal > 0) {
                await updateCalories(Math.round(totalCal));
                await loadData();
                if (!isSilent) alert(`Synced ${Math.round(totalCal)} calories from Health Connect!`);
            } else if (!isSilent) {
                alert('No calorie data found in Health Connect.');
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
            const history = await getCaloriesHistory(days);

            setTodayData(daily);
            setGoals(activityGoals);
            setHistoryData(history);

            const calculatedStats = calculateStats(history, 'calories');
            setStats(calculatedStats);

            animateProgress(daily?.caloriesBurned || 0, activityGoals.calories || 2000);
        } catch (error) {
            console.error('Error loading calories data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    const animateProgress = (currentCal, goalCal) => {
        const percentage = goalCal > 0 ? (currentCal / goalCal) * 100 : 0;

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

        // Fire flicker animation
        startFireAnimation();
    };

    const startFireAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fireAnim, {
                    toValue: 1.15,
                    duration: 300,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(fireAnim, {
                    toValue: 0.95,
                    duration: 200,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(fireAnim, {
                    toValue: 1.1,
                    duration: 250,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(fireAnim, {
                    toValue: 1,
                    duration: 250,
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

    const currentCalories = todayData?.caloriesBurned || 0;
    const goalCalories = goals.calories || 2000;
    const progressPercentage = goalCalories > 0 ? (currentCalories / goalCalories) * 100 : 0;

    const getChartData = () => {
        if (selectedPeriod === 'Day') {
            return [{ day: 'Today', calories: currentCalories, goal: goalCalories }];
        }
        return historyData.slice(-7).map((item) => {
            const date = new Date(item.date);
            return {
                day: dayNames[date.getDay()],
                calories: item.calories || 0,
                goal: item.goal || goalCalories,
            };
        });
    };

    const weeklyData = getChartData();

    // Circular Progress with Flame Icon
    const CaloriesGauge = ({ size = scale(200), strokeWidth = scale(16) }) => {
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
                        <LinearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FFD54F" />
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
                            stroke="url(#caloriesGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.gaugeContent}>
                    <Animated.View style={{ transform: [{ scale: fireAnim }] }}>
                        <Ionicons name="flame" size={moderateScale(36)} color={THEME.primary} />
                    </Animated.View>
                    <Text style={styles.caloriesValue}>{currentCalories.toLocaleString()}</Text>
                    <Text style={styles.caloriesLabel}>of {goalCalories.toLocaleString()} kcal</Text>
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
                    <Text style={styles.noDataText}>No calorie data available</Text>
                </View>
            );
        }

        const maxCalories = Math.max(...weeklyData.map(d => d.calories), 1);
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
                            <Stop offset="0%" stopColor={THEME.primary} />
                            <Stop offset="100%" stopColor={THEME.primaryLight} />
                        </LinearGradient>
                        <LinearGradient id="barGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={THEME.primaryDark} />
                            <Stop offset="100%" stopColor={THEME.primary} />
                        </LinearGradient>
                    </Defs>
                    {weeklyData.slice(-7).map((item, index) => {
                        const barHeight = maxCalories > 0 ? (item.calories / maxCalories) * chartHeight : 0;
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
                                    fill="#FFF4E5"
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

    // Calorie breakdown
    const breakdownData = [
        { label: 'Active', value: Math.round(currentCalories * 0.6), color: THEME.primary, icon: 'walk' },
        { label: 'Resting', value: Math.round(currentCalories * 0.3), color: '#3498DB', icon: 'bed' },
        { label: 'Other', value: Math.round(currentCalories * 0.1), color: '#27AE60', icon: 'ellipse' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.loadingText}>Loading calorie data...</Text>
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
                    <Text style={styles.headerTitle}>Calories Burned</Text>
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

                    {/* Calories Gauge */}
                    <View style={styles.gaugeSection}>
                        <CaloriesGauge />
                        {progressPercentage >= 100 && (
                            <View style={styles.achievedBadge}>
                                <Ionicons name="trophy" size={moderateScale(16)} color={THEME.primary} />
                                <Text style={styles.achievedText}>Goal Achieved!</Text>
                            </View>
                        )}
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: '#FFF4E5' }]}>
                            <Ionicons name="trending-up" size={scale(20)} color={THEME.primary} />
                            <Text style={styles.statValue}>{stats.avg.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Daily Avg</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E4FFE4' }]}>
                            <Ionicons name="trophy" size={scale(20)} color="#27AE60" />
                            <Text style={styles.statValue}>{stats.best.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Best Day</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="stats-chart" size={scale(20)} color="#3498DB" />
                            <Text style={styles.statValue}>{stats.total.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total</Text>
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

                    {/* Breakdown */}
                    <Text style={styles.sectionTitleFull}>Calorie Breakdown</Text>
                    <View style={styles.breakdownContainer}>
                        {breakdownData.map((item, index) => (
                            <View key={index} style={styles.breakdownCard}>
                                <View style={[styles.breakdownIcon, { backgroundColor: `${item.color}20` }]}>
                                    <Ionicons name={item.icon} size={scale(20)} color={item.color} />
                                </View>
                                <View style={styles.breakdownInfo}>
                                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                                    <Text style={styles.breakdownValue}>{item.value.toLocaleString()} kcal</Text>
                                </View>
                                <View style={styles.breakdownBar}>
                                    <View
                                        style={[
                                            styles.breakdownFill,
                                            {
                                                backgroundColor: item.color,
                                                width: `${(item.value / currentCalories || 0) * 100}%`
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Add Calories Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddActivityScreen', { type: 'calories' })}
                    >
                        <Ionicons name="add-circle" size={scale(24)} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add Calories Manually</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default CaloriesScreen;

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
    caloriesValue: {
        fontSize: moderateScale(36),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(4),
    },
    caloriesLabel: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
        marginTop: verticalScale(2),
    },
    achievedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E5',
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: scale(20),
        marginTop: hp(2),
        gap: scale(6),
    },
    achievedText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: THEME.primaryDark,
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
    breakdownContainer: {
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    breakdownCard: {
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
    breakdownIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    breakdownInfo: {
        flex: 1,
        marginLeft: scale(14),
    },
    breakdownLabel: {
        fontSize: moderateScale(14),
        color: THEME.textSecondary,
    },
    breakdownValue: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: THEME.text,
        marginTop: verticalScale(2),
    },
    breakdownBar: {
        width: scale(60),
        height: scale(6),
        backgroundColor: '#F1F5F9',
        borderRadius: scale(3),
        overflow: 'hidden',
    },
    breakdownFill: {
        height: '100%',
        borderRadius: scale(3),
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
