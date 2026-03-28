import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import bluetoothService from '../../Utils/bluetoothService';
import { addHeartRateReading, addStepReading } from '../../Utils/firebaseActivityStorage';

export default function AutoMonitorScreen({ navigation, route }) {
  const { connectedDevice } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    heartRate: '72',
    steps: '1000',
    sleep: '7',
    calories: '100',
    water: '1.5',
    running: '20',
    yoga: '12',
    cycling: '1.5',
    spo2: '98',
    temp: '36.6',
    weather: 'Clear',
  });

  const syncData = useCallback(async () => {
    if (!connectedDevice?.id) return;

    try {
      setRefreshing(true);
      console.log('[AutoMonitor] Syncing data from:', connectedDevice.id);

      // 1. Read Heart Rate (Single read)
      const hr = await bluetoothService.readHeartRate(connectedDevice.id);
      if (hr) {
        setMetrics(prev => ({ ...prev, heartRate: hr.toString() }));
        await addHeartRateReading(hr);
      }

      // 2. Read Steps (if supported)
      const steps = await bluetoothService.readStepCount(connectedDevice.id);
      if (steps) {
        setMetrics(prev => ({ ...prev, steps: steps.toString() }));
        await addStepReading(steps);
      }

      // Add more extractions here if the device supports non-standard GATT

    } catch (error) {
      console.error('[AutoMonitor] Sync error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [connectedDevice]);

  useEffect(() => {
    let hrSubscription;

    const startMonitoring = async () => {
      if (!connectedDevice?.id) return;

      // Start Real-time Heart Rate if available via notifications
      const success = await bluetoothService.startHeartRateNotification(connectedDevice.id, (hr) => {
        setMetrics(prev => ({ ...prev, heartRate: hr.toString() }));
        addHeartRateReading(hr); // Sync to firebase in background
      });

      if (!success) {
        console.warn('[AutoMonitor] Heart rate notification not supported or failed');
        // Fallback to manual sync
        syncData();
      }
    };

    startMonitoring();

    return () => {
      if (connectedDevice?.id) {
        bluetoothService.stopNotification(connectedDevice.id, '0000180d-0000-1000-8000-00805f9b34fb', '00002a37-0000-1000-8000-00805f9b34fb');
      }
    };
  }, [connectedDevice, syncData]);

  const autoMonitorData = [
    { title: 'Heart Rate', value: metrics.heartRate, unit: 'bpm', status: parseInt(metrics.heartRate) > 100 ? 'High' : 'Normal', icon: 'pulse', color: '#4B6CF6' },
    { title: 'Steps', value: metrics.steps, unit: 'Steps', percent: 'Today', icon: 'walk', color: '#B36AFF' },
    { title: 'Sleep', value: metrics.sleep, unit: 'hrs', status: 'Healthy', icon: 'moon', color: '#FFA26B' },
    { title: 'Calories', value: metrics.calories, unit: 'Kcal', status: 'Normal', icon: 'flame', color: '#FF6B6B' },
    { title: 'Water', value: metrics.water, unit: 'Liter', percent: '60%', icon: 'water', color: '#4B6CF6' },
    { title: 'SPO2', value: metrics.spo2, unit: '%', icon: 'speedometer', status: 'Normal', color: '#FF4B4B' },
    { title: 'Body Temp', value: metrics.temp, unit: '°C', icon: 'thermometer', color: '#FFA500' },
    { title: 'Weather', value: metrics.weather, unit: '', icon: 'cloudy', color: '#4B6CF6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#23238E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto Health Monitor</Text>
          <TouchableOpacity onPress={syncData} style={styles.syncIconButton}>
            <Ionicons name="refresh" size={moderateScale(22)} color="#23238E" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={syncData} />
          }
        >
          {/* Device Info */}
          <View style={styles.deviceInfoPanel}>
            <Text style={styles.connectedText}>Connected to: {connectedDevice?.name || 'Device'}</Text>
            <Text style={styles.syncStatus}>{refreshing ? 'Extracting data...' : 'Real-time Sync Active'}</Text>
          </View>

          <View style={styles.grid}>
            {autoMonitorData.map((item, idx) => (
              <View key={idx} style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={moderateScale(26)} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.status && <Text style={[styles.status, { color: item.color }]}>{item.status}</Text>}
                {item.percent && <Text style={styles.percent}>{item.percent}</Text>}
                <Text style={styles.value}>
                  {item.value} <Text style={styles.unit}>{item.unit}</Text>
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(12),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#23238E',
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  sosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: wp(4),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    gap: scale(12),
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23238E',
    borderRadius: scale(20),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    flex: 1,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sosBtnText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  syncIconButton: {
    padding: scale(8),
  },
  deviceInfoPanel: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    padding: scale(16),
    borderRadius: scale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  connectedText: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#1E2A78',
  },
  syncStatus: {
    fontSize: moderateScale(12),
    color: '#4B6CF6',
    marginTop: verticalScale(4),
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(4),
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(16),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  iconCircle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#444',
    marginBottom: verticalScale(4),
  },
  status: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  percent: {
    fontSize: moderateScale(12),
    color: '#888',
    marginBottom: verticalScale(2),
  },
  value: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
    marginTop: verticalScale(4),
  },
  unit: {
    fontSize: moderateScale(12),
    fontWeight: 'normal',
    color: '#666',
  }
});
