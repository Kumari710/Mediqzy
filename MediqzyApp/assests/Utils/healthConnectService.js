import { initialize, getSdkStatus, SdkAvailabilityStatus, requestPermission, readRecords } from 'react-native-health-connect';

/**
 * Health Connect Service
 * Handles initialization, permissions, and data fetching from Android Health Connect
 */
class HealthConnectService {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize Health Connect
     */
    async init() {
        try {
            const status = await getSdkStatus();
            if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
                console.log('Health Connect not available or update required. Status:', status);
                return false;
            }

            const initialized = await initialize();
            this.isInitialized = true;
            console.log('Health Connect initialized:', initialized);
            return true;
        } catch (error) {
            console.error('Error initializing Health Connect:', error);
            return false;
        }
    }

    /**
     * Request permissions for Health Connect
     */
    async requestPermissions() {
        try {
            if (!this.isInitialized) {
                const ok = await this.init();
                if (!ok) return false;
            }

            const permissions = [
                { accessType: 'read', recordType: 'Steps' },
                { accessType: 'write', recordType: 'Steps' },
                { accessType: 'read', recordType: 'HeartRate' },
                { accessType: 'write', recordType: 'HeartRate' },
                { accessType: 'read', recordType: 'SleepSession' },
                { accessType: 'write', recordType: 'SleepSession' },
                { accessType: 'read', recordType: 'TotalCaloriesBurned' },
                { accessType: 'write', recordType: 'TotalCaloriesBurned' },
                { accessType: 'read', recordType: 'Distance' },
                { accessType: 'write', recordType: 'Distance' },
            ];

            const grantedPermissions = await requestPermission(permissions);
            console.log('Granted Permissions:', grantedPermissions);
            return grantedPermissions;
        } catch (error) {
            console.error('Error requesting Health Connect permissions:', error);
            return false;
        }
    }

    /**
     * Read steps for a specific time range
     */
    async getSteps(startTime, endTime) {
        try {
            if (!this.isInitialized) await this.init();

            const result = await readRecords('Steps', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime,
                    endTime,
                },
            });
            return result;
        } catch (error) {
            console.error('Error reading steps:', error);
            return [];
        }
    }

    /**
     * Read heart rate for a specific time range
     */
    async getHeartRate(startTime, endTime) {
        try {
            if (!this.isInitialized) await this.init();

            const result = await readRecords('HeartRate', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime,
                    endTime,
                },
            });
            return result;
        } catch (error) {
            console.error('Error reading heart rate:', error);
            return [];
        }
    }

    /**
     * Read sleep sessions for a specific time range
     */
    async getSleep(startTime, endTime) {
        try {
            if (!this.isInitialized) await this.init();

            const result = await readRecords('SleepSession', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime,
                    endTime,
                },
            });
            return result;
        } catch (error) {
            console.error('Error reading sleep:', error);
            return [];
        }
    }

    /**
     * Read calories for a specific time range
     */
    async getCalories(startTime, endTime) {
        try {
            if (!this.isInitialized) await this.init();

            const result = await readRecords('TotalCaloriesBurned', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime,
                    endTime,
                },
            });
            return result;
        } catch (error) {
            console.error('Error reading calories:', error);
            return [];
        }
    }

    /**
     * Read distance for a specific time range
     */
    async getDistance(startTime, endTime) {
        try {
            if (!this.isInitialized) await this.init();

            const result = await readRecords('Distance', {
                timeRangeFilter: {
                    operator: 'between',
                    startTime,
                    endTime,
                },
            });
            return result;
        } catch (error) {
            console.error('Error reading distance:', error);
            return [];
        }
    }
}

export const healthConnectService = new HealthConnectService();
export default healthConnectService;
