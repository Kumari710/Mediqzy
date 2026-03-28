/**
 * Pedometer Service
 * Auto-tracks steps using device sensors
 * 
 * Note: This requires the react-native-sensors package to be installed:
 * npm install react-native-sensors
 * 
 * For production, consider using:
 * - react-native-health (iOS HealthKit)
 * - react-native-google-fit (Android Google Fit)
 * - @react-native-community/react-native-pedometer
 */

import { updateSteps, getDailyActivity, saveDailyActivity, getTodayDate, disableMockData } from './firebaseActivityStorage';

// Pedometer state
let isPedometerActive = false;
let stepCount = 0;
let lastSaveTime = Date.now();
let accelerometerSubscription = null;
let lastAcceleration = { x: 0, y: 0, z: 0 };
let stepThreshold = 1.2; // Sensitivity threshold
let lastStepTime = 0;
let minStepInterval = 250; // Minimum ms between steps

/**
 * Simple step detection using accelerometer
 * This is a basic implementation - for production use a proper pedometer library
 */
const detectStep = (acceleration) => {
    const now = Date.now();

    // Calculate magnitude
    const magnitude = Math.sqrt(
        acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
    );

    // Detect step based on magnitude change
    const lastMagnitude = Math.sqrt(
        lastAcceleration.x * lastAcceleration.x +
        lastAcceleration.y * lastAcceleration.y +
        lastAcceleration.z * lastAcceleration.z
    );

    const delta = Math.abs(magnitude - lastMagnitude);
    lastAcceleration = acceleration;

    // Step detected if delta exceeds threshold and enough time has passed
    if (delta > stepThreshold && (now - lastStepTime) > minStepInterval) {
        lastStepTime = now;
        return true;
    }

    return false;
};

/**
 * Start the pedometer
 * @returns {Promise<boolean>} Success status
 */
export const startPedometer = async () => {
    if (isPedometerActive) {
        console.log('Pedometer already active');
        return true;
    }

    try {
        // Disable mock data since real tracking is starting
        await disableMockData();

        // Try to import react-native-sensors
        let accelerometer;
        try {
            const sensors = require('react-native-sensors');
            accelerometer = sensors.accelerometer;
        } catch (e) {
            console.warn('react-native-sensors not installed. Using mock pedometer.');
            return startMockPedometer();
        }

        // Load current step count (skip mock data since we disabled it)
        const dailyData = await getDailyActivity(null, false);
        stepCount = dailyData.steps || 0;

        // Subscribe to accelerometer
        accelerometerSubscription = accelerometer.subscribe(({ x, y, z }) => {
            if (detectStep({ x, y, z })) {
                stepCount++;

                // Save every 30 seconds to avoid too many writes
                if (Date.now() - lastSaveTime > 30000) {
                    saveStepCount();
                }
            }
        });

        isPedometerActive = true;
        console.log('Pedometer started');
        return true;
    } catch (error) {
        console.error('Error starting pedometer:', error);
        return false;
    }
};

/**
 * Start a mock pedometer for testing (simulates step counting)
 */
const startMockPedometer = async () => {
    // Disable mock data since real (simulated) tracking is starting
    await disableMockData();

    const dailyData = await getDailyActivity(null, false);
    stepCount = dailyData.steps || 0;

    // Simulate steps (adds random steps every 5 seconds)
    accelerometerSubscription = setInterval(() => {
        const randomSteps = Math.floor(Math.random() * 10) + 1; // 1-10 steps
        stepCount += randomSteps;

        if (Date.now() - lastSaveTime > 30000) {
            saveStepCount();
        }
    }, 5000);

    isPedometerActive = true;
    console.log('Mock pedometer started (for testing)');
    return true;
};

/**
 * Stop the pedometer
 */
export const stopPedometer = async () => {
    if (!isPedometerActive) {
        return false;
    }

    try {
        if (accelerometerSubscription) {
            if (typeof accelerometerSubscription.unsubscribe === 'function') {
                accelerometerSubscription.unsubscribe();
            } else if (typeof accelerometerSubscription === 'number') {
                clearInterval(accelerometerSubscription);
            }
            accelerometerSubscription = null;
        }

        // Save final step count
        await saveStepCount();

        isPedometerActive = false;
        console.log('Pedometer stopped');
        return true;
    } catch (error) {
        console.error('Error stopping pedometer:', error);
        return false;
    }
};

/**
 * Get current step count
 */
export const getCurrentSteps = () => {
    return stepCount;
};

/**
 * Check if pedometer is active
 */
export const isPedometerRunning = () => {
    return isPedometerActive;
};

/**
 * Save step count to storage
 */
const saveStepCount = async () => {
    try {
        await updateSteps(stepCount);
        lastSaveTime = Date.now();
        console.log(`Steps saved: ${stepCount}`);
    } catch (error) {
        console.error('Error saving steps:', error);
    }
};

/**
 * Reset step count (for new day)
 */
export const resetDailySteps = async () => {
    stepCount = 0;
    lastSaveTime = Date.now();
    await saveStepCount();
};

/**
 * Set step detection sensitivity
 * @param {number} sensitivity - Value between 0.5 (very sensitive) and 3.0 (less sensitive)
 */
export const setSensitivity = (sensitivity) => {
    stepThreshold = Math.max(0.5, Math.min(3.0, sensitivity));
};

/**
 * Get pedometer statistics
 */
export const getPedometerStats = async () => {
    const dailyData = await getDailyActivity();

    return {
        isActive: isPedometerActive,
        currentSteps: stepCount,
        savedSteps: dailyData.steps || 0,
        lastSaveTime: new Date(lastSaveTime).toISOString(),
        sensitivity: stepThreshold,
    };
};

/**
 * Manually add steps
 * @param {number} steps - Number of steps to add
 */
export const addSteps = async (steps) => {
    stepCount += steps;
    await saveStepCount();
    return stepCount;
};

/**
 * Set step count manually
 * @param {number} steps - Total step count
 */
export const setSteps = async (steps) => {
    stepCount = steps;
    await saveStepCount();
    return stepCount;
};

export default {
    startPedometer,
    stopPedometer,
    getCurrentSteps,
    isPedometerRunning,
    resetDailySteps,
    setSensitivity,
    getPedometerStats,
    addSteps,
    setSteps,
};
