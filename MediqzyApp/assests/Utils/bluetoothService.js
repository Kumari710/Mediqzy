import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

/**
 * Bluetooth Utility Service using react-native-ble-plx
 * Handles BLE device scanning, connection, and data reading.
 */

class BluetoothService {
    constructor() {
        this.manager = null;
        this.isInitialized = false;
        this.isScanning = false;
        this.devices = new Map();
        this.scanSubscription = null;
        this.connectedDevices = new Map();
        this.onDeviceFoundCallback = null;
        this.scanTimeout = null;
    }

    /**
     * Initialize handles the BLE manager setup
     */
    async init() {
        if (this.isInitialized && this.manager) return true;

        if (!this.manager) {
            console.log('[BLE] Creating new BleManager instance');
            this.manager = new BleManager();
        }

        return new Promise((resolve) => {
            // Safety timeout: if state doesn't change to PoweredOn in 3s, resolve anyway
            // so we can check the state manually and inform the user.
            const timeout = setTimeout(() => {
                console.warn('[BLE] Initialization timed out. Current state unknown.');
                subscription.remove();
                resolve(false);
            }, 3000);

            const subscription = this.manager.onStateChange((state) => {
                console.log('[BLE] State changed to:', state);
                if (state === State.PoweredOn) {
                    this.isInitialized = true;
                    clearTimeout(timeout);
                    subscription.remove();
                    resolve(true);
                } else if (state === State.PoweredOff || state === State.Unauthorized) {
                    clearTimeout(timeout);
                    subscription.remove();
                    resolve(false);
                }
            }, true);
        });
    }

    /**
     * Request permissions for Bluetooth on Android
     */
    async requestPermissions() {
        if (Platform.OS === 'android') {
            const apiLevel = Platform.Version;
            console.log('[BLE] Checking permissions for API level:', apiLevel);

            if (apiLevel < 31) {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);
                const isGranted = (
                    granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                );
                console.log('[BLE] Permissions granted (API < 31):', isGranted);
                return isGranted;
            } else {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                const isGranted = (
                    granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                );

                // Note: Some devices strictly require Location to be ON
                console.log('[BLE] Permissions granted (API 31+):', isGranted);
                return isGranted;
            }
        }
        return true;
    }

    /**
     * Start scanning for BLE devices
     */
    async startScan(duration = 5) {
        const isReady = await this.init();
        if (!isReady) {
            const state = await this.manager.state();
            if (state !== State.PoweredOn) {
                console.error('[BLE] Bluetooth is not PoweredOn. State:', state);
                throw new Error('Please turn on Bluetooth and Location to scan for devices.');
            }
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.error('[BLE] Permissions not granted');
            throw new Error('Bluetooth and Location permissions are required. Please enable them in Settings.');
        }

        if (this.isScanning) {
            this.stopScan();
        }

        this.devices.clear();
        this.isScanning = true;

        console.log('[BLE] Starting scan for', duration, 'seconds...');

        try {
            // Check for devices already connected to the system
            // We check both bonded and connected devices
            const connectedDevices = await this.manager.connectedDevices([]);
            console.log('[BLE] Found', connectedDevices.length, 'already connected system devices');
            connectedDevices.forEach(device => {
                const info = {
                    id: device.id,
                    name: device.name || device.localName || 'Paired Device',
                    rssi: -50,
                    isPaired: true
                };
                this.devices.set(device.id, info);
                if (this.onDeviceFoundCallback) this.onDeviceFoundCallback(info);
            });
        } catch (e) {
            console.warn('[BLE] Error fetching connected devices:', e);
        }

        const scanOptions = {
            allowDuplicates: true,
            scanMode: 'LowLatency', // Max scan frequency for faster discovery
        };

        this.manager.startDeviceScan(null, scanOptions, (error, device) => {
            if (error) {
                // If the error is 'Bluetooth is powered off', handle it
                if (error.errorCode === 102) { // BleErrorCode.BluetoothPoweredOff
                    this.stopScan();
                    return;
                }
                console.error('[BLE] Scan error:', error);
                this.isScanning = false;
                if (this.onScanStopCallback) this.onScanStopCallback();
                return;
            }

            if (device) {
                const name = device.name || device.localName;

                // Fire-Boltt often shows up as "FB108" or similar
                // We show even unnamed devices to help debug
                const updatedDevice = {
                    id: device.id,
                    name: name || 'Unknown Device',
                    rssi: device.rssi,
                    manufacturerData: device.manufacturerData
                };

                // Only update if it's new or has a name now
                if (!this.devices.has(device.id) || (name && this.devices.get(device.id).name === 'Unknown Device')) {
                    this.devices.set(device.id, updatedDevice);
                    if (this.onDeviceFoundCallback) {
                        this.onDeviceFoundCallback(updatedDevice);
                    }
                }
            }
        });

        // Handle scan timeout
        return new Promise((resolve) => {
            if (this.scanTimeout) clearTimeout(this.scanTimeout);
            this.scanTimeout = setTimeout(() => {
                this.stopScan();
                const foundDevices = Array.from(this.devices.values());
                console.log('[BLE] Scan period finished. Found', foundDevices.length, 'devices.');
                resolve(foundDevices);
            }, duration * 1000);
        });
    }

    /**
     * Stop scanning
     */
    stopScan() {
        console.log('[BLE] Stopping scan');
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }
        this.manager.stopDeviceScan();
        this.isScanning = false;
        if (this.onScanStopCallback) {
            this.onScanStopCallback();
        }
    }

    /**
     * Connect to a specific device
     */
    async connect(deviceId) {
        try {
            console.log('[BLE] Connecting to', deviceId);
            const device = await this.manager.connectToDevice(deviceId);
            console.log('[BLE] Connected. Discovering all services...');

            // Critical for Fire-Boltt: We MUST discover components before reading
            await device.discoverAllServicesAndCharacteristics();

            this.connectedDevices.set(deviceId, device);

            // Log services to help identify custom Fire-Boltt IDs
            this.getDeviceServices(deviceId);

            return device;
        } catch (error) {
            console.error('[BLE] Connection error:', error);
            return null;
        }
    }

    /**
     * Debug helper to see what sensors the watch actually has
     */
    async getDeviceServices(deviceId) {
        try {
            const device = this.connectedDevices.get(deviceId);
            if (!device) return;
            const services = await device.services();
            console.log(`[BLE] Device ${deviceId} has ${services.length} services:`);
            for (const service of services) {
                const chars = await service.characteristics();
                console.log(`  - Service: ${service.uuid} (${chars.length} characteristics)`);
            }
        } catch (e) {
            console.warn('[BLE] Could not dump services:', e);
        }
    }

    /** Read battery level (standard Service 0x180F) */
    async readBatteryLevel(deviceId) {
        try {
            const data = await this.readCharacteristic(deviceId, '0000180f-0000-1000-8000-00805f9b34fb', '00002a19-0000-1000-8000-00805f9b34fb');
            if (data) return data[0];
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Disconnect from a device
     */
    async disconnect(deviceId) {
        try {
            await this.manager.cancelDeviceConnection(deviceId);
            this.connectedDevices.delete(deviceId);
            console.log('[BLE] Disconnected from', deviceId);
            return true;
        } catch (error) {
            console.error('[BLE] Disconnection error:', error);
            return false;
        }
    }

    /**
     * Listen for discovered devices
     */
    onDeviceDiscovered(callback) {
        this.onDeviceFoundCallback = callback;
        return {
            remove: () => {
                this.onDeviceFoundCallback = null;
            }
        };
    }

    /**
     * Listen for scan status changes
     */
    onScanStop(callback) {
        // ble-plx doesn't have an event for this, so we simulate it
        this.onScanStopCallback = callback;
        return {
            remove: () => {
                this.onScanStopCallback = null;
            }
        };
    }

    /** Generic read characteristic helper */
    async readCharacteristic(deviceId, serviceUUID, characteristicUUID) {
        try {
            const device = this.connectedDevices.get(deviceId);
            if (!device) return null;

            // Optional: Ensure services are discovered
            // await device.discoverAllServicesAndCharacteristics();

            const characteristic = await device.readCharacteristicForService(serviceUUID, characteristicUUID);
            if (characteristic && characteristic.value) {
                const buffer = Buffer.from(characteristic.value, 'base64');
                return new Uint8Array(buffer);
            }
            return null;
        } catch (error) {
            // Silencing "Unknown error" for non-existent characteristics (common in smartwatches)
            if (error.message.includes('Unknown error') || error.message.includes('not found')) {
                console.log(`[BLE] Characteristic ${characteristicUUID} not supported by this device.`);
            } else {
                console.error('[BLE] Read error:', error);
            }
            return null;
        }
    }

    /** Start notification for a characteristic */
    async startNotification(deviceId, serviceUUID, characteristicUUID, listener) {
        try {
            const device = this.connectedDevices.get(deviceId);
            if (!device) throw new Error('Device not connected');

            const subscription = device.monitorCharacteristicForService(
                serviceUUID,
                characteristicUUID,
                (error, characteristic) => {
                    if (error) {
                        console.error('[BLE] Notification error:', error);
                        return;
                    }
                    if (characteristic.value) {
                        const buffer = Buffer.from(characteristic.value, 'base64');
                        listener(new Uint8Array(buffer));
                    }
                }
            );

            const key = `${deviceId}-${serviceUUID}-${characteristicUUID}`;
            this.notificationSubscription = subscription; // Simplified for now
            return true;
        } catch (error) {
            console.error('[BLE] Notification start error:', error);
            return false;
        }
    }

    /** Stop notification */
    async stopNotification(deviceId, serviceUUID, characteristicUUID) {
        // ble-plx handles this by removing the subscription
        if (this.notificationSubscription) {
            this.notificationSubscription.remove();
        }
        return true;
    }

    /** Read Heart Rate (Try standard and common custom) */
    async readHeartRate(deviceId) {
        // Standard HR UUID
        const stdService = '0000180d-0000-1000-8000-00805f9b34fb';
        const stdChar = '00002a37-0000-1000-8000-00805f9b34fb';

        // Custom China Watch UUIDs (Used by many Fire-Boltt models)
        const customService = '0000fee7-0000-1000-8000-00805f9b34fb';
        const customChar = '0000fec9-0000-1000-8000-00805f9b34fb';

        let data = await this.readCharacteristic(deviceId, stdService, stdChar);
        if (!data) {
            console.log('[BLE] Trying custom HR path...');
            data = await this.readCharacteristic(deviceId, customService, customChar);
        }

        if (!data) return null;
        const flags = data[0];
        const hr = (flags & 0x01) === 0 ? data[1] : (data[1] | (data[2] << 8));
        return hr;
    }

    /** Start continuous heart rate notifications */
    async startHeartRateNotification(deviceId, callback) {
        const serviceUUID = '0000180d-0000-1000-8000-00805f9b34fb';
        const characteristicUUID = '00002a37-0000-1000-8000-00805f9b34fb';

        // Try to monitor standard HR
        const success = await this.startNotification(deviceId, serviceUUID, characteristicUUID, data => {
            const flags = data[0];
            const hr = (flags & 0x01) === 0 ? data[1] : (data[1] | (data[2] << 8));
            callback(hr);
        });

        if (!success) {
            // Try custom Fire-Boltt path
            return this.startNotification(deviceId, '0000fee7-0000-1000-8000-00805f9b34fb', '0000fec9-0000-1000-8000-00805f9b34fb', data => {
                if (data && data.length > 1) callback(data[1]);
            });
        }
        return success;
    }

    /** Read Step Count (standard 0x1814 and custom Jieli) */
    async readStepCount(deviceId) {
        // 1. Try Jieli/Fire-Boltt Custom path
        let data = await this.readCharacteristic(deviceId, '0000fee7-0000-1000-8000-00805f9b34fb', '0000fed3-0000-1000-8000-00805f9b34fb');

        // 2. Try Standard path
        if (!data) {
            data = await this.readCharacteristic(deviceId, '00001814-0000-1000-8000-00805f9b34fb', '00002a53-0000-1000-8000-00805f9b34fb');
        }

        if (!data) return null;
        // Steps are usually stored in 4 bytes
        const steps = data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
        return steps;
    }
}

const bluetoothService = new BluetoothService();
export default bluetoothService;
