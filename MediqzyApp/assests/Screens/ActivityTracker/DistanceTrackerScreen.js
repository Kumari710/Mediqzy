import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    getDailyActivity,
    getDistanceHistory,
    getActivityGoals,
    calculateStats,
    updateDistance,
} from '../../Utils/firebaseActivityStorage';
import { healthConnectService } from '../../Utils/healthConnectService';

const { width } = Dimensions.get('window');

const DistanceTrackerScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Week');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [todayData, setTodayData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({ avg: 0, best: 0, total: 0 });
    const [goals, setGoals] = useState({ distance: 5 });

    const periods = ['Day', 'Week', 'Month', 'Year'];

    const getDaysForPeriod = (period) => {
        switch (period) {
            case 'Day': return 1;
            case 'Week': return 7;
            case 'Month': return 30;
            case 'Year': return 365;
            default: return 7;
        }
    };

    const handleSyncHealthConnect = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);

            const startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date();

            const distanceData = await healthConnectService.getDistance(startTime.toISOString(), endTime.toISOString());

            if (distanceData.length > 0) {
                const totalDist = distanceData.reduce((sum, record) => {
                    return sum + (record.distance?.inKilometers || record.distance?.inMeters / 1000 || 0);
                }, 0);

                if (totalDist > 0) {
                    await updateDistance(totalDist);
                    await loadData();
                    if (!isSilent) alert(`Synced ${totalDist.toFixed(2)} km from Health Connect!`);
                }
            } else if (!isSilent) {
                alert('No distance data found in Health Connect for today.');
            }
        } catch (error) {
            console.error('Sync Error:', error);
            if (!isSilent) alert('Failed to sync with Health Connect');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const getGoalForPeriod = (period, dailyGoal) => {
        switch (period) {
            case 'Day': return dailyGoal;
            case 'Week': return dailyGoal * 7;
            case 'Month': return dailyGoal * 30;
            case 'Year': return dailyGoal * 365;
            default: return dailyGoal * 7;
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
            const history = await getDistanceHistory(days);

            setTodayData(daily);
            setGoals(activityGoals);
            setHistoryData(history);

            const calculatedStats = calculateStats(history, 'total');
            setStats(calculatedStats);
        } catch (error) {
            console.error('Error loading distance data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation, loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const totalDistance = parseFloat((todayData?.distance || 0).toFixed(2));
    const walkingDistance = parseFloat((todayData?.walkingDistance || 0).toFixed(2));
    const runningDistance = parseFloat((todayData?.runningDistance || 0).toFixed(2));
    const cyclingDistance = parseFloat((todayData?.cyclingDistance || 0).toFixed(2));

    const goalDistance = getGoalForPeriod(selectedPeriod, goals.distance || 5);
    const periodTotal = selectedPeriod === 'Day' ? totalDistance : parseFloat(stats.total.toFixed(2));
    const progressPercentage = goalDistance > 0 ? (periodTotal / goalDistance) * 100 : 0;

    // Calculate percentages for pie chart
    const totalForPie = walkingDistance + runningDistance + cyclingDistance || 1;
    const walkingP = (walkingDistance / totalForPie) * 100;
    const runningP = (runningDistance / totalForPie) * 100;
    const cyclingP = (cyclingDistance / totalForPie) * 100;

    // Distance breakdown (for pie chart)
    const distanceBreakdown = [
        { label: 'Walking', value: walkingDistance, color: '#3498DB', percentage: walkingP },
        { label: 'Running', value: runningDistance, color: '#E74C3C', percentage: runningP },
        { label: 'Cycling', value: cyclingDistance, color: '#27AE60', percentage: cyclingP },
    ];

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'Day': return 'km today';
            case 'Week': return 'km this week';
            case 'Month': return 'km this month';
            case 'Year': return 'km this year';
            default: return 'km';
        }
    };

    const weeklyStats = [
        { label: 'Total', value: periodTotal.toFixed(1), unit: 'km' },
        { label: 'Average', value: (stats.avg || totalDistance).toFixed(1), unit: 'km/day' },
        { label: 'Best', value: (stats.best || totalDistance).toFixed(1), unit: 'km' },
    ];

    // Pie Chart Component
    const PieChart = () => {
        const size = scale(180);
        const strokeWidth = scale(35);
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;

        let currentAngle = -90; // Start from top

        return (
            <View style={styles.pieContainer}>
                <Svg width={size} height={size}>
                    {distanceBreakdown.map((item, index) => {
                        if (item.percentage === 0) return null;

                        const angle = (item.percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                        const rotation = startAngle;

                        return (
                            <G key={index} rotation={rotation} origin={`${size / 2}, ${size / 2}`}>
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    strokeLinecap="round"
                                />
                            </G>
                        );
                    })}
                </Svg>
                <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterValue}>{periodTotal.toFixed(1)}</Text>
                    <Text style={styles.pieCenterLabel}>{getPeriodLabel()}</Text>
                </View>
            </View>
        );
    };

    // Recent activities based on stored data
    const recentActivities = [
        {
            name: 'Morning Walk',
            time: 'Today, 7:30 AM',
            distance: (walkingDistance * 0.5).toFixed(1),
            icon: 'walk',
            color: '#3498DB',
            bgColor: '#E4F0FF',
        },
        {
            name: 'Evening Jog',
            time: 'Today, 6:00 PM',
            distance: runningDistance.toFixed(1),
            icon: 'fitness',
            color: '#E74C3C',
            bgColor: '#FFE4E4',
        },
        {
            name: 'Cycling',
            time: 'Yesterday, 5:30 PM',
            distance: cyclingDistance.toFixed(1),
            icon: 'bicycle',
            color: '#27AE60',
            bgColor: '#E4FFE4',
        },
    ].filter(a => parseFloat(a.distance) > 0);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color="#3498DB" />
                <Text style={styles.loadingText}>Loading distance data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Distance Tracker</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleSyncHealthConnect} style={styles.syncButton}>
                            <Ionicons name="sync-outline" size={moderateScale(24)} color="#FFB800" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <Ionicons name="calendar-outline" size={moderateScale(24)} color="#1E3A8A" />
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
                            colors={['#3498DB']}
                            tintColor="#3498DB"
                        />
                    }
                >
                    {/* Period Selector */}
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

                    {/* Pie Chart */}
                    <View style={styles.chartSection}>
                        <PieChart />
                    </View>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        {distanceBreakdown.map((item, index) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendLabel}>{item.label}</Text>
                                <Text style={styles.legendValue}>{item.value.toFixed(1)} km</Text>
                            </View>
                        ))}
                    </View>

                    {/* Weekly Stats */}
                    <Text style={styles.sectionTitle}>This {selectedPeriod}</Text>
                    <View style={styles.statsCards}>
                        {weeklyStats.map((stat, index) => (
                            <View key={index} style={styles.statsCard}>
                                <Text style={styles.statsCardLabel}>{stat.label}</Text>
                                <Text style={styles.statsCardValue}>{stat.value}</Text>
                                <Text style={styles.statsCardUnit}>{stat.unit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Daily Goal Progress */}
                    <View style={styles.goalCard}>
                        <View style={styles.goalHeader}>
                            <Text style={styles.goalTitle}>{selectedPeriod} Goal</Text>
                            <Text style={styles.goalProgress}>
                                {periodTotal.toFixed(1)} / {goalDistance} km
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${Math.min(progressPercentage, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.goalRemaining}>
                            {progressPercentage >= 100
                                ? '🎉 Goal achieved!'
                                : `${(goalDistance - periodTotal).toFixed(1)} km remaining`
                            }
                        </Text>
                    </View>

                    {/* Recent Activities */}
                    {recentActivities.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Recent Activities</Text>
                            <View style={styles.activityList}>
                                {recentActivities.map((activity, index) => (
                                    <View key={index} style={styles.activityItem}>
                                        <View style={[styles.activityIcon, { backgroundColor: activity.bgColor }]}>
                                            <Ionicons name={activity.icon} size={moderateScale(20)} color={activity.color} />
                                        </View>
                                        <View style={styles.activityDetails}>
                                            <Text style={styles.activityName}>{activity.name}</Text>
                                            <Text style={styles.activityTime}>{activity.time}</Text>
                                        </View>
                                        <Text style={styles.activityDistance}>{activity.distance} km</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default DistanceTrackerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
        color: '#64748B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#FFFFFF',
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
        marginRight: scale(4),
    },
    menuButton: {
        padding: scale(8),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        borderRadius: scale(12),
        padding: scale(4),
    },
    periodButton: {
        flex: 1,
        paddingVertical: hp(1.2),
        alignItems: 'center',
        borderRadius: scale(10),
    },
    periodButtonActive: {
        backgroundColor: '#1E3A8A',
    },
    periodText: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#64748B',
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    chartSection: {
        alignItems: 'center',
        paddingVertical: hp(4),
    },
    pieContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pieCenter: {
        position: 'absolute',
        alignItems: 'center',
    },
    pieCenterValue: {
        fontSize: moderateScale(36),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    pieCenterLabel: {
        fontSize: moderateScale(14),
        color: '#64748B',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: scale(12),
        marginVertical: verticalScale(4),
    },
    legendDot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        marginRight: scale(6),
    },
    legendLabel: {
        fontSize: moderateScale(13),
        color: '#64748B',
        marginRight: scale(4),
    },
    legendValue: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#1E293B',
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    statsCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(16),
        width: '31%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsCardLabel: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginBottom: verticalScale(4),
    },
    statsCardValue: {
        fontSize: moderateScale(20),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    statsCardUnit: {
        fontSize: moderateScale(11),
        color: '#94A3B8',
        marginTop: verticalScale(2),
    },
    goalCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(3),
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    goalTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#1E293B',
    },
    goalProgress: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#3498DB',
    },
    progressBar: {
        height: verticalScale(8),
        backgroundColor: '#E2E8F0',
        borderRadius: scale(4),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3498DB',
        borderRadius: scale(4),
    },
    goalRemaining: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginTop: verticalScale(8),
    },
    activityList: {
        paddingHorizontal: wp(5),
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: scale(12),
        padding: scale(12),
        marginBottom: verticalScale(10),
    },
    activityIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityDetails: {
        flex: 1,
        marginLeft: scale(12),
    },
    activityName: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#1E293B',
    },
    activityTime: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginTop: verticalScale(2),
    },
    activityDistance: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#3498DB',
    },
});
