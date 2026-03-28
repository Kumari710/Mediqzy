/**
 * Firebase Activity Storage Service
 * 
 * Cloud-based activity storage using Firestore
 * Syncs data across devices and provides real-time updates
 * Falls back to local storage when offline
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Collection names
const COLLECTIONS = {
    ACTIVITY: 'activityData',
    GOALS: 'activityGoals',
};

// Local storage keys for offline caching
const LOCAL_KEYS = {
    ACTIVITY_CACHE: '@firebase_activity_cache_',
    GOALS_CACHE: '@firebase_goals_cache',
    PENDING_SYNC: '@firebase_pending_sync',
    MOCK_DATA_INITIALIZED: '@mock_data_initialized',
};

/**
 * Check if using mock data (no real data stored yet)
 */
export const isUsingMockData = async () => {
    try {
        const userId = getCurrentUserId();
        // If logged in, we check if they have any real data.
        // For simplicity and matching original logic, use a local flag.
        const initialized = await AsyncStorage.getItem(LOCAL_KEYS.MOCK_DATA_INITIALIZED);
        return initialized !== 'false';
    } catch (error) {
        return true;
    }
};

/**
 * Populate with demo data for the last 7 days
 */
export const populateDemoData = async () => {
    try {
        const dates = getLastNDays(7);
        const userId = getCurrentUserId();

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];

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
                isMockData: true,
            };

            await saveDailyActivity(demoData, date);
        }

        await AsyncStorage.setItem(LOCAL_KEYS.MOCK_DATA_INITIALIZED, 'true');
        console.log('Demo data populated successfully!');
        return true;
    } catch (error) {
        console.error('Error populating demo data:', error);
        return false;
    }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get current user ID
 */
const getCurrentUserId = () => {
    return auth().currentUser?.uid || null;
};

/**
 * Disable mock data (call this when real tracking starts)
 */
export const disableMockData = async () => {
    try {
        await AsyncStorage.setItem(LOCAL_KEYS.MOCK_DATA_INITIALIZED, 'false');
        return true;
    } catch (error) {
        console.error('Error disabling mock data:', error);
        return false;
    }
};

/**
 * Enable mock data
 */
export const enableMockData = async () => {
    try {
        await AsyncStorage.setItem(LOCAL_KEYS.MOCK_DATA_INITIALIZED, 'true');
        return true;
    } catch (error) {
        console.error('Error enabling mock data:', error);
        return false;
    }
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Format date to YYYY-MM-DD
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
// DAILY ACTIVITY FUNCTIONS
// =====================================================

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

    // Sleep
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

/**
 * Save daily activity to Firestore
 * @param {object} data - Activity data
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const saveDailyActivity = async (data, date = null) => {
    const userId = getCurrentUserId();
    const targetDate = date || getTodayDate();

    try {
        // 1. Always save locally first (for offline support and quick UI)
        await saveActivityLocally(data, targetDate);

        if (userId) {
            // 2. Save to Firestore using native merge (no need to fetch first)
            const docRef = firestore()
                .collection(COLLECTIONS.ACTIVITY)
                .doc(userId)
                .collection('daily')
                .doc(targetDate);

            // Clean the data - remove undefined values that Firestore doesn't accept
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, value]) => value !== undefined)
            );

            const cloudData = {
                ...cleanData,
                date: targetDate,
                lastUpdated: firestore.FieldValue.serverTimestamp(),
            };

            // This merges with existing cloud data without needing to fetch it first
            await docRef.set(cloudData, { merge: true });
            console.log('✅ Activity saved to Firebase for:', targetDate);
            return true;
        } else {
            console.warn('⚠️ No user logged in, data saved locally only');
            return true; // Already saved locally
        }
    } catch (error) {
        console.error('❌ Error saving daily activity to Firebase:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, null, 2));
        // data already saved locally in step 1
        // Mark for sync later
        await addPendingSync(targetDate, data);
        return false;
    }
};

// Static mock data for activity tracker screens
const STATIC_MOCK_DATA = {
    today: {
        steps: 7842,
        stepsGoal: 10000,
        caloriesBurned: 485,
        caloriesGoal: 500,
        activeCalories: 385,
        restingCalories: 100,
        distance: 5.97,
        distanceGoal: 5,
        walkingDistance: 3.2,
        runningDistance: 1.8,
        cyclingDistance: 0.97,
        currentHeartRate: 72,
        minHeartRate: 58,
        maxHeartRate: 142,
        avgHeartRate: 76,
        sleepHours: 7.5,
        sleepGoal: 8,
        sleepQuality: 85,
        deepSleep: 1.8,
        lightSleep: 3.7,
        remSleep: 1.5,
        awakeTime: 0.5,
        bedtime: '11:00 PM',
        wakeTime: '6:30 AM',
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

const getMockDataForDay = (dayOffset) => {
    const historyItem = STATIC_MOCK_DATA.history.find(h => h.date === dayOffset);
    const base = historyItem ? {
        steps: historyItem.steps,
        caloriesBurned: historyItem.calories,
        distance: historyItem.distance,
        sleepHours: historyItem.sleepHours,
        sleepQuality: historyItem.sleepQuality,
        currentHeartRate: historyItem.heartRate,
        avgHeartRate: historyItem.heartRate,
    } : STATIC_MOCK_DATA.today;

    return {
        ...getDefaultDailyActivity(),
        ...base,
        isMockData: true,
    };
};

/**
 * Get daily activity from Firestore
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {boolean} useMockIfEmpty - Whether to return mock data if no stored data exists
 */
export const getDailyActivity = async (date = null, useMockIfEmpty = true) => {
    const userId = getCurrentUserId();
    const targetDate = date || getTodayDate();

    try {
        let data = null;
        if (userId) {
            data = await getDailyActivityFromCloud(targetDate);

            // If cloud fetch failed or returned nothing, check local cache
            if (!data || (data.steps === 0 && data.caloriesBurned === 0 && data.distance === 0)) {
                const localData = await getActivityFromLocal(targetDate);
                if (localData && (localData.steps > 0 || localData.caloriesBurned > 0 || localData.distance > 0)) {
                    data = localData;
                }
            }
        } else {
            data = await getActivityFromLocal(targetDate);
        }

        // Check if data is still "empty"
        const isEmpty = !data || (data.steps === 0 && data.caloriesBurned === 0 && data.distance === 0);

        if (isEmpty && useMockIfEmpty) {
            const useMock = await isUsingMockData();
            if (useMock) {
                // Calculate day offset from today
                const today = new Date(getTodayDate());
                const targetDay = new Date(targetDate);
                const diffTime = targetDay - today;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                return getMockDataForDay(diffDays);
            }
        }

        return data || getDefaultDailyActivity();
    } catch (error) {
        console.error('Error getting daily activity:', error);
        return getActivityFromLocal(targetDate);
    }
};

/**
 * Get activity from Firestore
 */
const getDailyActivityFromCloud = async (date) => {
    const userId = getCurrentUserId();
    if (!userId) return null;

    try {
        const doc = await firestore()
            .collection(COLLECTIONS.ACTIVITY)
            .doc(userId)
            .collection('daily')
            .doc(date)
            .get();

        if (doc.exists) {
            return { ...getDefaultDailyActivity(), ...doc.data() };
        }
        return null; // Explicitly return null if doc doesn't exist
    } catch (error) {
        // Use warn instead of error to avoid red screen in dev
        console.warn('Cloud fetch error (falling back to local):', error.message);
        return null;
    }
};

/**
 * Cache activity locally
 */
const cacheActivityLocally = async (date, data) => {
    try {
        await AsyncStorage.setItem(
            LOCAL_KEYS.ACTIVITY_CACHE + date,
            JSON.stringify(data)
        );
    } catch (error) {
        console.error('Error caching activity:', error);
    }
};

/**
 * Get activity from local storage
 */
const getActivityFromLocal = async (date) => {
    try {
        const data = await AsyncStorage.getItem(LOCAL_KEYS.ACTIVITY_CACHE + date);
        return data ? JSON.parse(data) : getDefaultDailyActivity();
    } catch (error) {
        return getDefaultDailyActivity();
    }
};

/**
 * Save activity locally (offline mode)
 */
const saveActivityLocally = async (data, date) => {
    try {
        const existingData = await getActivityFromLocal(date);
        const mergedData = {
            ...existingData,
            ...data,
            date,
            lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem(
            LOCAL_KEYS.ACTIVITY_CACHE + date,
            JSON.stringify(mergedData)
        );
        return true;
    } catch (error) {
        console.error('Error saving locally:', error);
        return false;
    }
};

// =====================================================
// HISTORY FUNCTIONS
// =====================================================

/**
 * Get steps history
 * @param {number} days - Number of days
 */
export const getStepsHistory = async (days = 7) => {
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
};

/**
 * Get sleep history
 * @param {number} days - Number of days
 */
export const getSleepHistory = async (days = 7) => {
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
        });
    }

    return history;
};

/**
 * Get distance history
 * @param {number} days - Number of days
 */
export const getDistanceHistory = async (days = 7) => {
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
};

/**
 * Get heart rate history
 * @param {number} days - Number of days
 */
export const getHeartRateHistory = async (days = 7) => {
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
};

/**
 * Get calories history
 * @param {number} days - Number of days
 */
export const getCaloriesHistory = async (days = 7) => {
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
};

// =====================================================
// GOALS FUNCTIONS
// =====================================================

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

/**
 * Save activity goals
 * @param {object} goals - Goals object
 */
export const saveActivityGoals = async (goals) => {
    const userId = getCurrentUserId();

    try {
        // Always save locally first
        await AsyncStorage.setItem(LOCAL_KEYS.GOALS_CACHE, JSON.stringify(goals));

        if (userId) {
            await firestore()
                .collection(COLLECTIONS.GOALS)
                .doc(userId)
                .set({
                    ...goals,
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
        }
        return true;
    } catch (error) {
        console.warn('Error saving goals (saved locally):', error.message);
        return false;
    }
};

/**
 * Get activity goals
 */
export const getActivityGoals = async () => {
    const userId = getCurrentUserId();

    try {
        if (userId) {
            try {
                const doc = await firestore()
                    .collection(COLLECTIONS.GOALS)
                    .doc(userId)
                    .get();

                if (doc.exists) {
                    const cloudGoals = { ...getDefaultGoals(), ...doc.data() };
                    // Cache cloud goals locally for offline use
                    await AsyncStorage.setItem(LOCAL_KEYS.GOALS_CACHE, JSON.stringify(cloudGoals));
                    return cloudGoals;
                }
            } catch (cloudError) {
                // Silently handle cloud errors (e.g. permission denied, offline)
                // and fallback to local cache below
                console.warn('Cloud goals fetch failed, using local cache:', cloudError.message);
            }
        }

        // Try local cache
        const localGoals = await AsyncStorage.getItem(LOCAL_KEYS.GOALS_CACHE);
        if (localGoals) {
            return { ...getDefaultGoals(), ...JSON.parse(localGoals) };
        }

        return getDefaultGoals();
    } catch (error) {
        // Only log real unexpected errors
        console.warn('Error in getActivityGoals:', error.message);
        return getDefaultGoals();
    }
};

// =====================================================
// REAL-TIME SYNC
// =====================================================

/**
 * Subscribe to real-time activity updates
 * @param {string} date - Date to watch
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const subscribeToActivityUpdates = (date, callback) => {
    const userId = getCurrentUserId();
    if (!userId) {
        return () => { }; // No-op unsubscribe
    }

    return firestore()
        .collection(COLLECTIONS.ACTIVITY)
        .doc(userId)
        .collection('daily')
        .doc(date)
        .onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback({ ...getDefaultDailyActivity(), ...doc.data() });
                } else {
                    callback(getDefaultDailyActivity());
                }
            },
            (error) => {
                console.error('Realtime sync error:', error);
            }
        );
};

// =====================================================
// OFFLINE SYNC
// =====================================================

/**
 * Add data to pending sync queue
 */
const addPendingSync = async (date, data) => {
    try {
        const pending = await AsyncStorage.getItem(LOCAL_KEYS.PENDING_SYNC);
        const pendingData = pending ? JSON.parse(pending) : {};
        pendingData[date] = data;
        await AsyncStorage.setItem(LOCAL_KEYS.PENDING_SYNC, JSON.stringify(pendingData));
    } catch (error) {
        console.error('Error adding to pending sync:', error);
    }
};

/**
 * Sync pending data to cloud
 * Call this when app comes online or user logs in
 */
export const syncPendingData = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const pending = await AsyncStorage.getItem(LOCAL_KEYS.PENDING_SYNC);
        if (!pending) return;

        const pendingData = JSON.parse(pending);
        const batch = firestore().batch();

        for (const [date, data] of Object.entries(pendingData)) {
            const docRef = firestore()
                .collection(COLLECTIONS.ACTIVITY)
                .doc(userId)
                .collection('daily')
                .doc(date);

            batch.set(docRef, {
                ...data,
                lastUpdated: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }

        await batch.commit();
        await AsyncStorage.removeItem(LOCAL_KEYS.PENDING_SYNC);
        console.log('Pending data synced successfully');
    } catch (error) {
        console.error('Error syncing pending data:', error);
    }
};

// =====================================================
// STATISTICS
// =====================================================

/**
 * Calculate statistics for a history array
 * @param {array} history - History array
 * @param {string} valueKey - Key to calculate stats for
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
// UPDATE FUNCTIONS
// =====================================================

/**
 * Update step count
 * @param {number} steps - Step count
 */
export const updateSteps = async (steps) => {
    const today = getTodayDate();
    const data = await getDailyActivity(today);

    // Auto-calculate distance and calories
    const estimatedDistance = (steps * 0.762) / 1000;
    const activeCalories = Math.round(steps * 0.04);

    return await saveDailyActivity({
        steps,
        walkingDistance: estimatedDistance,
        distance: estimatedDistance + (data.runningDistance || 0) + (data.cyclingDistance || 0),
        activeCalories,
        caloriesBurned: activeCalories + (data.restingCalories || 0),
    }, today);
};/**
 * Add step reading
 * @param {number} steps - Total steps reported by device
 */
export const addStepReading = async (steps) => {
    return await updateSteps(steps);
};


/**
 * Add heart rate reading
 * @param {number} bpm - Heart rate in BPM
 */
export const addHeartRateReading = async (bpm) => {
    const today = getTodayDate();
    const data = await getDailyActivity(today);

    const reading = {
        bpm,
        timestamp: new Date().toISOString(),
    };

    const readings = data.heartRateReadings || [];
    readings.push(reading);

    const allBpm = readings.map(r => r.bpm);

    return await saveDailyActivity({
        currentHeartRate: bpm,
        heartRateReadings: readings,
        minHeartRate: Math.min(...allBpm),
        maxHeartRate: Math.max(...allBpm),
        avgHeartRate: Math.round(allBpm.reduce((a, b) => a + b, 0) / allBpm.length),
    }, today);
};

/**
 * Save sleep data
 * @param {object} sleepData - Sleep data object
 */
export const saveSleepData = async (sleepData) => {
    const today = getTodayDate();

    return await saveDailyActivity({
        sleepHours: sleepData.total || 0,
        sleepQuality: sleepData.quality || 0,
        deepSleep: sleepData.deep || 0,
        lightSleep: sleepData.light || 0,
        remSleep: sleepData.rem || 0,
        awakeTime: sleepData.awake || 0,
        bedtime: sleepData.bedtime || null,
        wakeTime: sleepData.wakeTime || null,
    }, today);
};

/**
 * Update distance
 * @param {number} walking - Walking distance
 * @param {number} running - Running distance
 * @param {number} cycling - Cycling distance
 */
export const updateDistance = async (walking = 0, running = 0, cycling = 0) => {
    const today = getTodayDate();

    return await saveDailyActivity({
        walkingDistance: walking,
        runningDistance: running,
        cyclingDistance: cycling,
        distance: walking + running + cycling,
    }, today);
};

/**
 * Update calories
 * @param {number} active - Active calories
 * @param {number} resting - Resting calories
 */
export const updateCalories = async (active, resting = 0) => {
    const today = getTodayDate();

    return await saveDailyActivity({
        activeCalories: active,
        restingCalories: resting,
        caloriesBurned: active + resting,
    }, today);
};

// =====================================================
// DATA MIGRATION
// =====================================================

/**
 * Migrate data from local AsyncStorage to Firebase
 * Call this after user signs up or logs in
 */
export const migrateLocalDataToFirebase = async () => {
    const userId = getCurrentUserId();
    if (!userId) return false;

    try {
        // Get all local activity keys
        const allKeys = await AsyncStorage.getAllKeys();
        const activityKeys = allKeys.filter(key =>
            key.startsWith('@activity_daily_') ||
            key.startsWith(LOCAL_KEYS.ACTIVITY_CACHE)
        );

        for (const key of activityKeys) {
            const data = await AsyncStorage.getItem(key);
            if (data) {
                const parsedData = JSON.parse(data);
                const date = parsedData.date || key.replace('@activity_daily_', '').replace(LOCAL_KEYS.ACTIVITY_CACHE, '');

                if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    await saveDailyActivity(parsedData, date);
                }
            }
        }

        console.log('Local data migrated to Firebase');
        return true;
    } catch (error) {
        console.error('Error migrating data:', error);
        return false;
    }
};

// Export default
export default {
    // Daily Activity
    saveDailyActivity,
    getDailyActivity,
    getDefaultDailyActivity,

    // History
    getStepsHistory,
    getSleepHistory,
    getDistanceHistory,
    getHeartRateHistory,
    getCaloriesHistory,

    // Updates
    updateSteps,
    addHeartRateReading,
    saveSleepData,
    updateDistance,
    updateCalories,

    // Goals
    saveActivityGoals,
    getActivityGoals,
    getDefaultGoals,

    // Stats
    calculateStats,
    getWeeklySummary,

    // Real-time
    subscribeToActivityUpdates,

    // Sync
    syncPendingData,
    migrateLocalDataToFirebase,

    // Utilities
    getTodayDate,
    formatDate,
    getLastNDays,

    // Mock Data
    isUsingMockData,
    populateDemoData,
    disableMockData,
    enableMockData,
};
