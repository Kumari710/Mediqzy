import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    getDailyActivity,
    getActivityGoals,
    populateDemoData,
    isUsingMockData,
} from '../../Utils/firebaseActivityStorage';
import { startPedometer, stopPedometer, isPedometerRunning, getCurrentSteps } from '../../Utils/pedometerService';
import { healthConnectService } from '../../Utils/healthConnectService';
import {
    updateSteps,
    updateCalories,
    updateDistance,
    addHeartRateReading,
    saveSleepData,
} from '../../Utils/firebaseActivityStorage';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ActivityTrackerScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pedometerActive, setPedometerActive] = useState(false);
    const [usingDemoData, setUsingDemoData] = useState(false);
    const [todayData, setTodayData] = useState({
        steps: 0,
        stepsGoal: 10000,
        calories: 0,
        caloriesGoal: 2000,
        distance: 0,
        distanceGoal: 5,
        heartRate: 0,
        sleep: 0,
        sleepGoal: 8,
        activeMinutes: 0,
    });

    // Animation refs
    const stepsAnim = useRef(new Animated.Value(0)).current;
    const caloriesAnim = useRef(new Animated.Value(0)).current;
    const distanceAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    // Load data from storage
    const loadData = useCallback(async () => {
        try {
            const isMockEnabled = await isUsingMockData();
            setUsingDemoData(isMockEnabled);

            const dailyActivity = await getDailyActivity();
            const goals = await getActivityGoals();

            let currentSteps = dailyActivity.steps || 0;
            if (isPedometerRunning()) {
                currentSteps = getCurrentSteps();
            }

            const newData = {
                steps: currentSteps,
                stepsGoal: goals.steps || 10000,
                calories: dailyActivity.caloriesBurned || 0,
                caloriesGoal: goals.calories || 2000,
                distance: parseFloat((dailyActivity.distance || 0).toFixed(1)),
                distanceGoal: goals.distance || 5,
                heartRate: dailyActivity.currentHeartRate || dailyActivity.avgHeartRate || 0,
                sleep: dailyActivity.sleepHours || 0,
                sleepGoal: goals.sleep || 8,
                activeMinutes: dailyActivity.activeMinutes || 0,
            };

            setTodayData(newData);
            setPedometerActive(isPedometerRunning());

            // Trigger animations
            animateProgress(newData);
        } catch (error) {
            console.error('Error loading activity data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const animateProgress = (data) => {
        // Reset animations
        stepsAnim.setValue(0);
        caloriesAnim.setValue(0);
        distanceAnim.setValue(0);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);

        const stepsPercent = Math.min((data.steps / data.stepsGoal) * 100, 100);
        const caloriesPercent = Math.min((data.calories / data.caloriesGoal) * 100, 100);
        const distancePercent = Math.min((data.distance / data.distanceGoal) * 100, 100);

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
            Animated.timing(stepsAnim, {
                toValue: stepsPercent,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(caloriesAnim, {
                toValue: caloriesPercent,
                duration: 1500,
                delay: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(distanceAnim, {
                toValue: distancePercent,
                duration: 1500,
                delay: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation, loadData]);

    useEffect(() => {
        let interval;
        if (pedometerActive) {
            interval = setInterval(() => {
                if (isPedometerRunning()) {
                    setTodayData(prev => ({
                        ...prev,
                        steps: getCurrentSteps(),
                    }));
                }
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [pedometerActive]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const togglePedometer = async () => {
        try {
            if (pedometerActive) {
                await stopPedometer();
                setPedometerActive(false);
                Alert.alert('Pedometer Stopped', 'Step tracking has been paused.');
            } else {
                const success = await startPedometer();
                if (success) {
                    setPedometerActive(true);
                    Alert.alert('Pedometer Started', 'Step tracking is now active!');
                } else {
                    Alert.alert('Error', 'Could not start pedometer.');
                }
            }
            loadData();
        } catch (error) {
            console.error('Pedometer toggle error:', error);
            Alert.alert('Error', 'Failed to toggle pedometer.');
        }
    };

    const handleGlobalSync = async () => {
        try {
            setLoading(true);
            const startTime = new Date();
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date();
            const startIso = startTime.toISOString();
            const endIso = endTime.toISOString();

            let syncedAny = false;

            // Steps - with null check
            try {
                const stepsRecords = await healthConnectService.getSteps(startIso, endIso);
                if (Array.isArray(stepsRecords) && stepsRecords.length > 0) {
                    const totalSteps = stepsRecords.reduce((sum, r) => sum + (r.count || 0), 0);
                    if (totalSteps > 0) {
                        await updateSteps(totalSteps);
                        syncedAny = true;
                    }
                }
            } catch (e) {
                console.warn('Steps sync skipped:', e.message);
            }

            // Calories - with null check
            try {
                const caloriesRecords = await healthConnectService.getCalories(startIso, endIso);
                if (Array.isArray(caloriesRecords) && caloriesRecords.length > 0) {
                    const totalCal = caloriesRecords.reduce((sum, r) => sum + (r.energy?.inKilocalories || r.energy?.inCalories / 1000 || 0), 0);
                    if (totalCal > 0) {
                        await updateCalories(Math.round(totalCal));
                        syncedAny = true;
                    }
                }
            } catch (e) {
                console.warn('Calories sync skipped:', e.message);
            }

            // Distance - with null check
            try {
                const distanceRecords = await healthConnectService.getDistance(startIso, endIso);
                if (Array.isArray(distanceRecords) && distanceRecords.length > 0) {
                    const totalDist = distanceRecords.reduce((sum, r) => sum + (r.distance?.inKilometers || r.distance?.inMeters / 1000 || 0), 0);
                    if (totalDist > 0) {
                        await updateDistance(totalDist);
                        syncedAny = true;
                    }
                }
            } catch (e) {
                console.warn('Distance sync skipped:', e.message);
            }

            // Heart Rate - with null check
            try {
                const hrRecords = await healthConnectService.getHeartRate(startIso, endIso);
                if (Array.isArray(hrRecords) && hrRecords.length > 0) {
                    const latestRecord = hrRecords[hrRecords.length - 1];
                    if (latestRecord?.samples && latestRecord.samples.length > 0) {
                        const latestSample = latestRecord.samples[latestRecord.samples.length - 1];
                        await addHeartRateReading(latestSample.beatsPerMinute);
                        syncedAny = true;
                    }
                }
            } catch (e) {
                console.warn('Heart rate sync skipped:', e.message);
            }

            // Sleep - with null check
            try {
                const sleepStart = new Date();
                sleepStart.setHours(sleepStart.getHours() - 24);
                const sleepRecords = await healthConnectService.getSleep(sleepStart.toISOString(), endIso);
                if (Array.isArray(sleepRecords) && sleepRecords.length > 0) {
                    const latestSleep = sleepRecords[sleepRecords.length - 1];
                    const s = new Date(latestSleep.startTime);
                    const e = new Date(latestSleep.endTime);
                    const duration = (e - s) / (1000 * 60 * 60);
                    if (duration > 0) {
                        await saveSleepData({
                            total: parseFloat(duration.toFixed(1)),
                            quality: 85,
                            bedtime: s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            wakeTime: e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        });
                        syncedAny = true;
                    }
                }
            } catch (e) {
                console.warn('Sleep sync skipped:', e.message);
            }

            await loadData();

            if (syncedAny) {
                Alert.alert('Sync Complete', 'Health data has been updated from your phone/watch.');
            } else {
                Alert.alert('No Data Found', 'No health data available in Health Connect. Make sure Health Connect has permission to access your fitness apps.');
            }
        } catch (error) {
            console.error('Global Sync Error:', error);
            Alert.alert('Sync Failed', 'Could not sync data. Please ensure Health Connect app is installed and permissions are granted.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadDemoData = async () => {
        Alert.alert(
            'Load Demo Data',
            'This will populate 7 days of sample activity data for testing.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Load',
                    onPress: async () => {
                        setLoading(true);
                        await populateDemoData();
                        await loadData();
                    }
                }
            ]
        );
    };

    // Multi-Ring Progress Component
    const MultiRingProgress = () => {
        const size = scale(220);
        const strokeWidth = scale(14);
        const gap = scale(16);

        // Outer ring (Steps - Orange/Yellow gradient)
        const outerRadius = (size - strokeWidth) / 2;
        const outerCircumference = outerRadius * 2 * Math.PI;

        // Middle ring (Calories - Red)
        const middleRadius = outerRadius - strokeWidth - gap;
        const middleCircumference = middleRadius * 2 * Math.PI;

        // Inner ring (Distance - Blue)
        const innerRadius = middleRadius - strokeWidth - gap;
        const innerCircumference = innerRadius * 2 * Math.PI;

        const stepsOffset = stepsAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [outerCircumference, 0],
        });

        const caloriesOffset = caloriesAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [middleCircumference, 0],
        });

        const distanceOffset = distanceAnim.interpolate({
            inputRange: [0, 100],
            outputRange: [innerCircumference, 0],
        });

        return (
            <Animated.View style={[styles.multiRingContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FFB800" />
                            <Stop offset="100%" stopColor="#FF8C42" />
                        </LinearGradient>
                        <LinearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#FF6B6B" />
                            <Stop offset="100%" stopColor="#E74C3C" />
                        </LinearGradient>
                        <LinearGradient id="distanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#4ECDC4" />
                            <Stop offset="100%" stopColor="#3498DB" />
                        </LinearGradient>
                    </Defs>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Outer Ring Background */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={outerRadius}
                            stroke="#F3F4F6"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Outer Ring Progress (Steps) */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={outerRadius}
                            stroke="url(#stepsGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${outerCircumference} ${outerCircumference}`}
                            strokeDashoffset={stepsOffset}
                            strokeLinecap="round"
                        />

                        {/* Middle Ring Background */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={middleRadius}
                            stroke="#F3F4F6"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Middle Ring Progress (Calories) */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={middleRadius}
                            stroke="url(#caloriesGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${middleCircumference} ${middleCircumference}`}
                            strokeDashoffset={caloriesOffset}
                            strokeLinecap="round"
                        />

                        {/* Inner Ring Background */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            stroke="#F3F4F6"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Inner Ring Progress (Distance) */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={innerRadius}
                            stroke="url(#distanceGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${innerCircumference} ${innerCircumference}`}
                            strokeDashoffset={distanceOffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>

                {/* Center Content */}
                <View style={styles.multiRingCenter}>
                    <Ionicons name="footsteps" size={moderateScale(32)} color="#1E3A8A" />
                    <Text style={styles.multiRingValue}>{todayData.steps.toLocaleString()}</Text>
                    <Text style={styles.multiRingLabel}>steps</Text>
                </View>
            </Animated.View>
        );
    };

    // Ring Legend
    const RingLegend = () => (
        <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFB800' }]} />
                <Text style={styles.legendText}>Steps</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E74C3C' }]} />
                <Text style={styles.legendText}>Calories</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3498DB' }]} />
                <Text style={styles.legendText}>Distance</Text>
            </View>
        </View>
    );

    const activities = [
        {
            id: 1,
            name: 'Steps',
            icon: 'footsteps',
            value: todayData.steps.toLocaleString(),
            goal: todayData.stepsGoal.toLocaleString(),
            unit: 'steps',
            screen: 'StepTrackerScreen',
            color: '#FFB800',
            bgColor: '#FFF8E7',
        },
        {
            id: 2,
            name: 'Calories',
            icon: 'flame',
            value: todayData.calories,
            goal: todayData.caloriesGoal,
            unit: 'kcal',
            screen: 'CaloriesScreen',
            color: '#E74C3C',
            bgColor: '#FFEBEB',
        },
        {
            id: 3,
            name: 'Distance',
            icon: 'navigate',
            value: todayData.distance,
            goal: todayData.distanceGoal,
            unit: 'km',
            screen: 'DistanceTrackerScreen',
            color: '#3498DB',
            bgColor: '#E8F4FD',
        },
        {
            id: 4,
            name: 'Heart Rate',
            icon: 'heart',
            value: todayData.heartRate || '--',
            unit: 'bpm',
            screen: 'HeartRateScreen',
            color: '#9B59B6',
            bgColor: '#F3E8FF',
        },
        {
            id: 5,
            name: 'Sleep',
            icon: 'moon',
            value: todayData.sleep,
            goal: todayData.sleepGoal,
            unit: 'hrs',
            screen: 'SleepTrackerScreen',
            color: '#00BFA5',
            bgColor: '#E0F7F4',
        },
    ];

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading activity data...</Text>
            </View>
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
                    <Text style={styles.headerTitle}>Activity Tracker</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerBtn} onPress={handleGlobalSync}>
                            <Ionicons name="sync-outline" size={moderateScale(22)} color="#1E3A8A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('GoalsSettingsScreen')}>
                            <Ionicons name="settings-outline" size={moderateScale(22)} color="#1E3A8A" />
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
                            colors={['#1E3A8A']}
                            tintColor="#1E3A8A"
                        />
                    }
                >
                    {/* Demo Data Badge */}
                    {usingDemoData && (
                        <TouchableOpacity style={styles.demoBadge} onPress={handleLoadDemoData}>
                            <Ionicons name="information-circle" size={moderateScale(16)} color="#F59E0B" />
                            <Text style={styles.demoBadgeText}>Using Demo Data</Text>
                        </TouchableOpacity>
                    )}

                    {/* Date & Pedometer Toggle */}
                    <View style={styles.dateSection}>
                        <View>
                            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</Text>
                            <Text style={styles.dateValue}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.pedometerButton, pedometerActive && styles.pedometerButtonActive]}
                            onPress={togglePedometer}
                        >
                            <Ionicons
                                name={pedometerActive ? "pause" : "play"}
                                size={moderateScale(18)}
                                color={pedometerActive ? "#FFFFFF" : "#1E3A8A"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Multi-Ring Progress */}
                    <View style={styles.progressSection}>
                        <MultiRingProgress />
                        <RingLegend />
                    </View>

                    {/* Quick Stats Cards */}
                    <View style={styles.quickStats}>
                        <View style={[styles.statCard, { backgroundColor: '#FFF8E7' }]}>
                            <Ionicons name="flame" size={moderateScale(24)} color="#E74C3C" />
                            <Text style={styles.statValue}>{todayData.calories}</Text>
                            <Text style={styles.statLabel}>kcal</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E8F4FD' }]}>
                            <Ionicons name="navigate" size={moderateScale(24)} color="#3498DB" />
                            <Text style={styles.statValue}>{todayData.distance}</Text>
                            <Text style={styles.statLabel}>km</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#E4FFE4' }]}>
                            <Ionicons name="time" size={moderateScale(24)} color="#27AE60" />
                            <Text style={styles.statValue}>{todayData.activeMinutes}</Text>
                            <Text style={styles.statLabel}>min</Text>
                        </View>
                    </View>

                    {/* Activity Cards */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Activities</Text>
                        <TouchableOpacity onPress={handleLoadDemoData}>
                            <Text style={styles.seeAllLink}>Demo Data</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activityGrid}>
                        {activities.map((activity, index) => (
                            <TouchableOpacity
                                key={activity.id}
                                style={[styles.activityCard, { backgroundColor: activity.bgColor }]}
                                onPress={() => navigation.navigate(activity.screen)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.activityCardHeader}>
                                    <View style={[styles.activityIconCircle, { backgroundColor: activity.color + '20' }]}>
                                        <Ionicons name={activity.icon} size={moderateScale(20)} color={activity.color} />
                                    </View>
                                    <Ionicons name="chevron-forward" size={moderateScale(18)} color="#94A3B8" />
                                </View>
                                <Text style={styles.activityCardValue}>
                                    {activity.value}
                                    <Text style={styles.activityCardUnit}> {activity.unit}</Text>
                                </Text>
                                <Text style={styles.activityCardName}>{activity.name}</Text>
                                {activity.goal && (
                                    <View style={styles.miniProgressContainer}>
                                        <View style={[styles.miniProgressBg, { backgroundColor: activity.color + '30' }]}>
                                            <View
                                                style={[
                                                    styles.miniProgressFill,
                                                    {
                                                        backgroundColor: activity.color,
                                                        width: `${Math.min((parseFloat(activity.value.toString().replace(/,/g, '')) / parseFloat(activity.goal.toString().replace(/,/g, ''))) * 100, 100)}%`
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitleFull}>Quick Actions</Text>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('AddActivityScreen', { type: 'steps' })}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF4E4' }]}>
                                <Ionicons name="add-circle" size={moderateScale(24)} color="#FF8C42" />
                            </View>
                            <Text style={styles.quickActionLabel}>Add Activity</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('GoalsSettingsScreen')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#E4F0FF' }]}>
                                <Ionicons name="flag" size={moderateScale(24)} color="#3498DB" />
                            </View>
                            <Text style={styles.quickActionLabel}>Set Goals</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('SleepTrackerScreen')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#F3E8FF' }]}>
                                <Ionicons name="moon" size={moderateScale(24)} color="#9B59B6" />
                            </View>
                            <Text style={styles.quickActionLabel}>Log Sleep</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default ActivityTrackerScreen;

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
    headerBtn: {
        padding: scale(8),
        marginLeft: scale(4),
    },
    scrollContent: {
        paddingBottom: hp(4),
    },
    demoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#FEF3C7',
        marginTop: hp(2),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: scale(20),
        gap: scale(6),
    },
    demoBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#B45309',
    },
    dateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(3),
    },
    greeting: {
        fontSize: moderateScale(14),
        color: '#64748B',
        fontWeight: '500',
    },
    dateValue: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#1E293B',
        marginTop: verticalScale(4),
    },
    pedometerButton: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        backgroundColor: '#E8EDF2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pedometerButtonActive: {
        backgroundColor: '#27AE60',
    },
    progressSection: {
        alignItems: 'center',
        paddingVertical: hp(3),
    },
    multiRingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    multiRingCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    multiRingValue: {
        fontSize: moderateScale(32),
        fontWeight: '700',
        color: '#1E3A8A',
        marginTop: verticalScale(4),
    },
    multiRingLabel: {
        fontSize: moderateScale(14),
        color: '#64748B',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(2),
        gap: scale(20),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    legendDot: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
    },
    legendText: {
        fontSize: moderateScale(12),
        color: '#64748B',
        fontWeight: '500',
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
    },
    statCard: {
        borderRadius: scale(16),
        padding: scale(16),
        alignItems: 'center',
        width: wp(28),
    },
    statValue: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        color: '#1E293B',
        marginTop: verticalScale(8),
    },
    statLabel: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginTop: verticalScale(2),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
    },
    sectionTitleFull: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E293B',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
        marginTop: hp(1),
    },
    seeAllLink: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#3498DB',
    },
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp(4),
        gap: scale(12),
    },
    activityCard: {
        width: (width - wp(8) - scale(12)) / 2,
        borderRadius: scale(20),
        padding: scale(16),
    },
    activityCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    activityIconCircle: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityCardValue: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: '#1E293B',
    },
    activityCardUnit: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        color: '#64748B',
    },
    activityCardName: {
        fontSize: moderateScale(14),
        color: '#64748B',
        marginTop: verticalScale(4),
    },
    miniProgressContainer: {
        marginTop: verticalScale(10),
    },
    miniProgressBg: {
        height: scale(6),
        borderRadius: scale(3),
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: scale(3),
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginBottom: hp(2),
    },
    quickActionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(16),
        alignItems: 'center',
        width: wp(28),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: scale(48),
        height: scale(48),
        borderRadius: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(8),
    },
    quickActionLabel: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
    },
});
