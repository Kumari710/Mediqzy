/**
 * Activity Tracker Storage Utility
 * Uses AsyncStorage to persist activity data locally
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
    DAILY_ACTIVITY: '@activity_daily_',          // Format: @activity_daily_2026-01-10
    ACTIVITY_GOALS: '@activity_goals',
    STEP_HISTORY: '@step_history',
    CALORIES_HISTORY: '@calories_history',
    DISTANCE_HISTORY: '@distance_history',
    HEART_RATE_HISTORY: '@heart_rate_history',
    SLEEP_HISTORY: '@sleep_history',
    USER_PREFERENCES: '@activity_preferences',
    MOCK_DATA_INITIALIZED: '@mock_data_initialized',
};

// =====================================================
// STATIC MOCK DATA (Shows immediately until real tracking begins)
// =====================================================

/**
 * Static mock data for activity tracker screens
 * This data is shown by default until database/tracker is activated
 */
const STATIC_MOCK_DATA = {
    today: {
        // Steps
        steps: 7842,
        stepsGoal: 10000,

        // Calories
        caloriesBurned: 485,
        caloriesGoal: 500,
        activeCalories: 385,
        restingCalories: 100,

        // Distance
        distance: 5.97,
        distanceGoal: 5,
        walkingDistance: 3.2,
        runningDistance: 1.8,
        cyclingDistance: 0.97,

        // Heart Rate
        currentHeartRate: 72,
        minHeartRate: 58,
        maxHeartRate: 142,
        avgHeartRate: 76,
        heartRateReadings: [
            { bpm: 62, timestamp: '2026-01-12T06:30:00' },
            { bpm: 78, timestamp: '2026-01-12T09:00:00' },
            { bpm: 142, timestamp: '2026-01-12T10:30:00' },
            { bpm: 72, timestamp: '2026-01-12T12:00:00' },
        ],

        // Sleep (from previous night)
        sleepHours: 7.5,
        sleepGoal: 8,
        sleepQuality: 85,
        deepSleep: 1.8,
        lightSleep: 3.7,
        remSleep: 1.5,
        awakeTime: 0.5,
        bedtime: '11:00 PM',
        wakeTime: '6:30 AM',

        // Activity Time
        activeMinutes: 45,
    },
    history: [
        { date: -6, steps: 8234, calories: 512, distance: 6.28, sleepHours: 7.2, sleepQuality: 82, heartRate: 74 },
        { date: -5, steps: 6521, calories: 398, distance: 4.97, sleepHours: 6.8, sleepQuality: 75, heartRate: 78 },
        { date: -4, steps: 9876, calories: 645, distance: 7.53, sleepHours: 8.1, sleepQuality: 90, heartRate: 71 },
        { date: -3, steps: 5432, calories: 320, distance: 4.14, sleepHours: 6.5, sleepQuality: 70, heartRate: 76 },
        { date: -2, steps: 11234, calories: 720, distance: 8.56, sleepHours: 7.8, sleepQuality: 88, heartRate: 69 },
        { date: -1, steps: 7654, calories: 458, distance: 5.83, sleepHours: 7.0, sleepQuality: 80, heartRate: 75 },
        { date: 0, steps: 7842, calories: 485, distance: 5.97, sleepHours: 7.5, sleepQuality: 85, heartRate: 72 },
    ],
};

/**
 * Get mock data for a specific day offset (0 = today, -1 = yesterday, etc.)
 */
const getMockDataForDay = (dayOffset) => {
    const historyItem = STATIC_MOCK_DATA.history.find(h => h.date === dayOffset);
    if (!historyItem) {
        return STATIC_MOCK_DATA.today;
    }

    const sleepHours = historyItem.sleepHours;
    return {
        steps: historyItem.steps,
        stepsGoal: 10000,
        caloriesBurned: historyItem.calories,
        caloriesGoal: 500,
        activeCalories: Math.round(historyItem.calories * 0.8),
        restingCalories: Math.round(historyItem.calories * 0.2),
        distance: historyItem.distance,
        distanceGoal: 5,
        walkingDistance: historyItem.distance * 0.54,
        runningDistance: historyItem.distance * 0.30,
        cyclingDistance: historyItem.distance * 0.16,
        currentHeartRate: historyItem.heartRate,
        minHeartRate: historyItem.heartRate - 14,
        maxHeartRate: historyItem.heartRate + 66,
        avgHeartRate: historyItem.heartRate,
        sleepHours: sleepHours,
        sleepGoal: 8,
        sleepQuality: historyItem.sleepQuality,
        deepSleep: parseFloat((sleepHours * 0.24).toFixed(1)),
        lightSleep: parseFloat((sleepHours * 0.49).toFixed(1)),
        remSleep: parseFloat((sleepHours * 0.20).toFixed(1)),
        awakeTime: parseFloat((sleepHours * 0.07).toFixed(1)),
        bedtime: '11:00 PM',
        wakeTime: '6:30 AM',
        activeMinutes: Math.round(historyItem.steps / 175),
    };
};

/**
 * Check if using mock data (no real data stored yet)
 */
export const isUsingMockData = async () => {
    try {
        const initialized = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED);
        return initialized !== 'false';
    } catch (error) {
        return true;
    }
};

/**
 * Disable mock data (call this when real tracking starts)
 */
export const disableMockData = async () => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED, 'false');
        return true;
    } catch (error) {
        console.error('Error disabling mock data:', error);
        return false;
    }
};

/**
 * Enable mock data again
 */
export const enableMockData = async () => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MOCK_DATA_INITIALIZED, 'true');
        return true;
    } catch (error) {
        console.error('Error enabling mock data:', error);
        return false;
    }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Get date string in YYYY-MM-DD format
 */
export const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Get dates for the last N days
 */
export const getLastNDays = (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(formatDate(date));
    }
    return dates;
};

// =====================================================
// DAILY ACTIVITY (Combined data for a single day)
// =====================================================

/**
 * Save daily activity data
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @param {Object} data - Activity data object
 */
export const saveDailyActivity = async (data, date = null) => {
    try {
        const targetDate = date || getTodayDate();
        const key = STORAGE_KEYS.DAILY_ACTIVITY + targetDate;
        const existingData = await getDailyActivity(targetDate);
        const mergedData = {
            ...existingData,
            ...data,
            lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(mergedData));
        return true;
    } catch (error) {
        console.error('Error saving daily activity:', error);
        return false;
    }
};

/**
 * Get daily activity data
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @param {boolean} useMockIfEmpty - Whether to return mock data if no stored data exists
 */
export const getDailyActivity = async (date = null, useMockIfEmpty = true) => {
    try {
        const targetDate = date || getTodayDate();
        const key = STORAGE_KEYS.DAILY_ACTIVITY + targetDate;
        const data = await AsyncStorage.getItem(key);

        if (data) {
            return JSON.parse(data);
        }

        // If no data stored and mock is enabled, return mock data
        if (useMockIfEmpty) {
            const useMock = await isUsingMockData();
            if (useMock) {
                // Calculate day offset from today
                const today = new Date(getTodayDate());
                const targetDay = new Date(targetDate);
                const diffTime = targetDay - today;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // Return mock data for this day
                const mockData = getMockDataForDay(diffDays);
                return {
                    ...mockData,
                    date: targetDate,
                    lastUpdated: null,
                    isMockData: true, // Flag to indicate this is mock data
                };
            }
        }

        return getDefaultDailyActivity();
    } catch (error) {
        console.error('Error getting daily activity:', error);
        return getDefaultDailyActivity();
    }
};

/**
 * Get default daily activity structure
 */
export const getDefaultDailyActivity = () => ({
    // Steps
    steps: 0,
    stepsGoal: 10000,

    // Calories
    caloriesBurned: 0,
    caloriesGoal: 500,
    activeCalories: 0,
    restingCalories: 0,

    // Distance
    distance: 0,
    distanceGoal: 5,
    walkingDistance: 0,
    runningDistance: 0,
    cyclingDistance: 0,

    // Heart Rate
    currentHeartRate: 0,
    minHeartRate: 0,
    maxHeartRate: 0,
    avgHeartRate: 0,
    heartRateReadings: [],

    // Sleep (from previous night)
    sleepHours: 0,
    sleepGoal: 8,
    sleepQuality: 0,
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awakeTime: 0,
    bedtime: null,
    wakeTime: null,

    // Activity Time
    activeMinutes: 0,

    // Metadata
    date: getTodayDate(),
    lastUpdated: null,
});

// =====================================================
// STEPS TRACKING
// =====================================================

/**
 * Update step count for today
 */
export const updateSteps = async (steps) => {
    try {
        const today = getTodayDate();
        const data = await getDailyActivity(today);
        data.steps = steps;

        // Auto-calculate distance (avg stride = 0.762m)
        const estimatedDistance = (steps * 0.762) / 1000;
        data.walkingDistance = estimatedDistance;
        data.distance = estimatedDistance + (data.runningDistance || 0) + (data.cyclingDistance || 0);

        // Auto-calculate calories (avg 0.04 cal per step)
        data.activeCalories = Math.round(steps * 0.04);
        data.caloriesBurned = data.activeCalories + (data.restingCalories || 0);

        await saveDailyActivity(data, today);
        return true;
    } catch (error) {
        console.error('Error updating steps:', error);
        return false;
    }
};

/**
 * Get step data for a date range
 */
export const getStepsHistory = async (days = 7) => {
    try {
        const dates = getLastNDays(days);
        const history = [];

        for (const date of dates) {
            const data = await getDailyActivity(date);
            history.push({
                date,
                steps: data.steps || 0,
                goal: data.stepsGoal || 10000,
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting steps history:', error);
        return [];
    }
};

// =====================================================
// CALORIES TRACKING
// =====================================================

/**
 * Update calories for today
 */
export const updateCalories = async (activeCalories, restingCalories = 0) => {
    try {
        const today = getTodayDate();
        const data = await getDailyActivity(today);
        data.activeCalories = activeCalories;
        data.restingCalories = restingCalories;
        data.caloriesBurned = activeCalories + restingCalories;
        await saveDailyActivity(data, today);
        return true;
    } catch (error) {
        console.error('Error updating calories:', error);
        return false;
    }
};

/**
 * Get calories history for a date range
 */
export const getCaloriesHistory = async (days = 7) => {
    try {
        const dates = getLastNDays(days);
        const history = [];

        for (const date of dates) {
            const data = await getDailyActivity(date);
            history.push({
                date,
                burned: data.caloriesBurned || 0,
                active: data.activeCalories || 0,
                resting: data.restingCalories || 0,
                goal: data.caloriesGoal || 500,
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting calories history:', error);
        return [];
    }
};

// =====================================================
// DISTANCE TRACKING
// =====================================================

/**
 * Update distance for today
 */
export const updateDistance = async (walking = 0, running = 0, cycling = 0) => {
    try {
        const today = getTodayDate();
        const data = await getDailyActivity(today);
        data.walkingDistance = walking;
        data.runningDistance = running;
        data.cyclingDistance = cycling;
        data.distance = walking + running + cycling;
        await saveDailyActivity(data, today);
        return true;
    } catch (error) {
        console.error('Error updating distance:', error);
        return false;
    }
};

/**
 * Get distance history for a date range
 */
export const getDistanceHistory = async (days = 7) => {
    try {
        const dates = getLastNDays(days);
        const history = [];

        for (const date of dates) {
            const data = await getDailyActivity(date);
            history.push({
                date,
                total: data.distance || 0,
                walking: data.walkingDistance || 0,
                running: data.runningDistance || 0,
                cycling: data.cyclingDistance || 0,
                goal: data.distanceGoal || 5,
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting distance history:', error);
        return [];
    }
};

// =====================================================
// HEART RATE TRACKING
// =====================================================

/**
 * Add a heart rate reading
 */
export const addHeartRateReading = async (bpm) => {
    try {
        const today = getTodayDate();
        const data = await getDailyActivity(today);

        const reading = {
            bpm,
            timestamp: new Date().toISOString(),
        };

        if (!data.heartRateReadings) {
            data.heartRateReadings = [];
        }

        data.heartRateReadings.push(reading);
        data.currentHeartRate = bpm;

        // Calculate min, max, avg
        const readings = data.heartRateReadings.map(r => r.bpm);
        data.minHeartRate = Math.min(...readings);
        data.maxHeartRate = Math.max(...readings);
        data.avgHeartRate = Math.round(readings.reduce((a, b) => a + b, 0) / readings.length);

        await saveDailyActivity(data, today);
        return true;
    } catch (error) {
        console.error('Error adding heart rate reading:', error);
        return false;
    }
};

/**
 * Get heart rate history for a date range
 */
export const getHeartRateHistory = async (days = 7) => {
    try {
        const dates = getLastNDays(days);
        const history = [];

        for (const date of dates) {
            const data = await getDailyActivity(date);
            history.push({
                date,
                current: data.currentHeartRate || 0,
                min: data.minHeartRate || 0,
                max: data.maxHeartRate || 0,
                avg: data.avgHeartRate || 0,
                readings: data.heartRateReadings || [],
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting heart rate history:', error);
        return [];
    }
};

// =====================================================
// SLEEP TRACKING
// =====================================================

/**
 * Save sleep data for a night
 */
export const saveSleepData = async (sleepData) => {
    try {
        const today = getTodayDate();
        const data = await getDailyActivity(today);

        data.sleepHours = sleepData.total || 0;
        data.sleepQuality = sleepData.quality || 0;
        data.deepSleep = sleepData.deep || 0;
        data.lightSleep = sleepData.light || 0;
        data.remSleep = sleepData.rem || 0;
        data.awakeTime = sleepData.awake || 0;
        data.bedtime = sleepData.bedtime || null;
        data.wakeTime = sleepData.wakeTime || null;

        await saveDailyActivity(data, today);
        return true;
    } catch (error) {
        console.error('Error saving sleep data:', error);
        return false;
    }
};

/**
 * Get sleep history for a date range
 */
export const getSleepHistory = async (days = 7) => {
    try {
        const dates = getLastNDays(days);
        const history = [];

        for (const date of dates) {
            const data = await getDailyActivity(date);
            history.push({
                date,
                total: data.sleepHours || 0,
                quality: data.sleepQuality || 0,
                deep: data.deepSleep || 0,
                light: data.lightSleep || 0,
                rem: data.remSleep || 0,
                awake: data.awakeTime || 0,
                goal: data.sleepGoal || 8,
                bedtime: data.bedtime,
                wakeTime: data.wakeTime,
            });
        }

        return history;
    } catch (error) {
        console.error('Error getting sleep history:', error);
        return [];
    }
};

// =====================================================
// GOALS MANAGEMENT
// =====================================================

/**
 * Save activity goals
 */
export const saveActivityGoals = async (goals) => {
    try {
        const existingGoals = await getActivityGoals();
        const mergedGoals = { ...existingGoals, ...goals };
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_GOALS, JSON.stringify(mergedGoals));
        return true;
    } catch (error) {
        console.error('Error saving activity goals:', error);
        return false;
    }
};

/**
 * Get activity goals
 */
export const getActivityGoals = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_GOALS);
        return data ? JSON.parse(data) : getDefaultGoals();
    } catch (error) {
        console.error('Error getting activity goals:', error);
        return getDefaultGoals();
    }
};

/**
 * Get default goals
 */
export const getDefaultGoals = () => ({
    steps: 10000,
    calories: 500,
    distance: 5,
    sleep: 8,
    activeMinutes: 30,
});

// =====================================================
// STATISTICS CALCULATIONS
// =====================================================

/**
 * Calculate statistics for a given history array
 */
export const calculateStats = (history, valueKey) => {
    if (!history || history.length === 0) {
        return { avg: 0, best: 0, total: 0, worst: 0 };
    }

    const values = history.map(h => h[valueKey] || 0);
    const nonZeroValues = values.filter(v => v > 0);

    return {
        avg: nonZeroValues.length > 0
            ? Math.round(nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length)
            : 0,
        best: Math.max(...values),
        worst: nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0,
        total: values.reduce((a, b) => a + b, 0),
    };
};

/**
 * Get weekly summary
 */
export const getWeeklySummary = async () => {
    try {
        const stepsHistory = await getStepsHistory(7);
        const caloriesHistory = await getCaloriesHistory(7);
        const distanceHistory = await getDistanceHistory(7);
        const sleepHistory = await getSleepHistory(7);

        return {
            steps: calculateStats(stepsHistory, 'steps'),
            calories: calculateStats(caloriesHistory, 'burned'),
            distance: calculateStats(distanceHistory, 'total'),
            sleep: calculateStats(sleepHistory, 'total'),
        };
    } catch (error) {
        console.error('Error getting weekly summary:', error);
        return null;
    }
};

// =====================================================
// DATA MANAGEMENT
// =====================================================

/**
 * Clear all activity data (use with caution!)
 */
export const clearAllActivityData = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const activityKeys = keys.filter(key =>
            key.startsWith('@activity_') ||
            key.startsWith('@step_') ||
            key.startsWith('@calories_') ||
            key.startsWith('@distance_') ||
            key.startsWith('@heart_rate_') ||
            key.startsWith('@sleep_')
        );
        await AsyncStorage.multiRemove(activityKeys);
        return true;
    } catch (error) {
        console.error('Error clearing activity data:', error);
        return false;
    }
};

/**
 * Export all activity data for backup
 */
export const exportActivityData = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const activityKeys = keys.filter(key => key.startsWith('@activity_'));
        const data = await AsyncStorage.multiGet(activityKeys);

        const exportData = {};
        data.forEach(([key, value]) => {
            exportData[key] = JSON.parse(value);
        });

        return exportData;
    } catch (error) {
        console.error('Error exporting activity data:', error);
        return null;
    }
};

/**
 * Import activity data from backup
 */
export const importActivityData = async (importData) => {
    try {
        const entries = Object.entries(importData).map(([key, value]) => [
            key,
            JSON.stringify(value),
        ]);
        await AsyncStorage.multiSet(entries);
        return true;
    } catch (error) {
        console.error('Error importing activity data:', error);
        return false;
    }
};

// =====================================================
// DEMO DATA (For testing purposes)
// =====================================================

/**
 * Populate with demo data for the last 7 days
 */
export const populateDemoData = async () => {
    try {
        const dates = getLastNDays(7);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const dayOfWeek = new Date(date).getDay();

            // Generate realistic random data
            const baseSteps = 5000 + Math.random() * 7000;
            const steps = Math.round(baseSteps);
            const distance = parseFloat((steps * 0.762 / 1000).toFixed(2));
            const calories = Math.round(steps * 0.04);
            const sleepHours = 5.5 + Math.random() * 3.5;

            const demoData = {
                steps: steps,
                stepsGoal: 10000,
                caloriesBurned: calories + Math.round(Math.random() * 100),
                caloriesGoal: 500,
                activeCalories: calories,
                restingCalories: Math.round(Math.random() * 100),
                distance: distance + Math.random() * 2,
                distanceGoal: 5,
                walkingDistance: distance * 0.6,
                runningDistance: distance * 0.25,
                cyclingDistance: distance * 0.15,
                currentHeartRate: 60 + Math.round(Math.random() * 40),
                minHeartRate: 50 + Math.round(Math.random() * 15),
                maxHeartRate: 100 + Math.round(Math.random() * 80),
                avgHeartRate: 65 + Math.round(Math.random() * 20),
                sleepHours: parseFloat(sleepHours.toFixed(1)),
                sleepGoal: 8,
                sleepQuality: 70 + Math.round(Math.random() * 25),
                deepSleep: parseFloat((sleepHours * 0.25).toFixed(1)),
                lightSleep: parseFloat((sleepHours * 0.50).toFixed(1)),
                remSleep: parseFloat((sleepHours * 0.18).toFixed(1)),
                awakeTime: parseFloat((sleepHours * 0.07).toFixed(1)),
                bedtime: '11:00 PM',
                wakeTime: '6:30 AM',
                activeMinutes: 30 + Math.round(Math.random() * 30),
                date: date,
                lastUpdated: new Date().toISOString(),
            };

            await saveDailyActivity(demoData, date);
        }

        console.log('Demo data populated successfully!');
        return true;
    } catch (error) {
        console.error('Error populating demo data:', error);
        return false;
    }
};

export default {
    // Daily Activity
    saveDailyActivity,
    getDailyActivity,
    getDefaultDailyActivity,

    // Steps
    updateSteps,
    getStepsHistory,

    // Calories
    updateCalories,
    getCaloriesHistory,

    // Distance
    updateDistance,
    getDistanceHistory,

    // Heart Rate
    addHeartRateReading,
    getHeartRateHistory,

    // Sleep
    saveSleepData,
    getSleepHistory,

    // Goals
    saveActivityGoals,
    getActivityGoals,

    // Statistics
    calculateStats,
    getWeeklySummary,

    // Utilities
    getTodayDate,
    formatDate,
    getLastNDays,

    // Data Management
    clearAllActivityData,
    exportActivityData,
    importActivityData,
    populateDemoData,

    // Mock Data
    isUsingMockData,
    enableMockData,
    disableMockData,
};
