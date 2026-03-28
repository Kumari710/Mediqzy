import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import bluetoothService from '../../Utils/bluetoothService';

export default function DeviceDetailsScreen({ navigation, route }) {
  const { device, connectedDevice } = route?.params || {};

  // Check if in demo mode (device passed from pairing screen without actual connection)
  const isDemoMode = device?.demoMode === true || !connectedDevice?.id;
  const deviceType = device?.type || connectedDevice?.type || 'watch';
  const deviceName = device?.name || connectedDevice?.name || 'Smart Device';

  const [battery, setBattery] = useState(isDemoMode ? '85' : '92');
  const [metrics, setMetrics] = useState(isDemoMode ? { hr: '72', steps: '4,528' } : { hr: '--', steps: '--' });
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate data refresh for demo mode
  const simulateDemoData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setMetrics({
        hr: Math.floor(Math.random() * 20 + 65).toString(), // 65-85 bpm
        steps: (Math.floor(Math.random() * 3000 + 3000)).toLocaleString(), // 3000-6000 steps
      });
      setBattery(Math.floor(Math.random() * 30 + 60).toString()); // 60-90%
      setIsSyncing(false);
    }, 1500);
  };

  const syncAllData = async () => {
    if (isDemoMode) {
      simulateDemoData();
      return;
    }

    if (!connectedDevice?.id) return;
    setIsSyncing(true);
    try {
      const hr = await bluetoothService.readHeartRate(connectedDevice.id);
      const steps = await bluetoothService.readStepCount(connectedDevice.id);
      setMetrics({
        hr: hr ? hr.toString() : '--',
        steps: steps ? steps.toString() : '--',
      });
      console.log('[DeviceDetails] Extracted data:', { hr, steps });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      // Auto-refresh demo data periodically
      const interval = setInterval(() => {
        setMetrics(prev => ({
          hr: Math.floor(Math.random() * 20 + 65).toString(),
          steps: prev.steps, // Keep steps consistent
        }));
      }, 5000);
      return () => clearInterval(interval);
    }

    let hrUnsubscribe = null;

    const setupConnection = async () => {
      if (!connectedDevice?.id) return;

      setIsSyncing(true);

      // 1. Initial Battery Read
      const level = await bluetoothService.readBatteryLevel(connectedDevice.id);
      if (level !== null) setBattery(level.toString());

      // 2. Start Real-time Heart Rate Stream (Recommended for Fire-Boltt)
      const success = await bluetoothService.startHeartRateNotification(connectedDevice.id, (hr) => {
        setMetrics(prev => ({ ...prev, hr: hr.toString() }));
      });

      if (!success) {
        console.log('[DeviceDetails] Standard HR Notify failed, trying manual sync...');
        syncAllData();
      }

      setIsSyncing(false);
    };

    setupConnection();

    return () => {
      if (connectedDevice?.id) {
        bluetoothService.stopNotification(connectedDevice.id, '0000180d-0000-1000-8000-00805f9b34fb', '00002a37-0000-1000-8000-00805f9b34fb');
      }
    };
  }, [connectedDevice, isDemoMode]);

  const deviceImages = {
    watch: require('../../images/smartwatch.png'),
    band: require('../../images/SmartBand.png'),
    ring: require('../../images/SmartRing.png'),
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Device</Text>
          <TouchableOpacity onPress={syncAllData} disabled={isSyncing}>
            <Ionicons
              name="sync"
              size={moderateScale(22)}
              color={isSyncing ? "#999" : "#23238E"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Demo Mode Banner */}
          {isDemoMode && (
            <View style={styles.demoBanner}>
              <Ionicons name="information-circle" size={moderateScale(18)} color="#FF9800" />
              <Text style={styles.demoBannerText}>Demo Mode - Simulated Data</Text>
            </View>
          )}

          {/* Device Card */}
          <View style={styles.deviceWrapper}>
            <View style={[styles.deviceCircle, isDemoMode && styles.deviceCircleDemo]}>
              <Image
                source={deviceImages[deviceType] || deviceImages.watch}
                style={styles.deviceImg}
                resizeMode="contain"
              />
              <View style={[styles.statusBadge, isDemoMode ? styles.statusBadgeDemo : styles.statusBadgeConnected]}>
                <View style={[styles.statusDot, isDemoMode ? styles.statusDotDemo : styles.statusDotConnected]} />
                <Text style={[styles.connected, isDemoMode ? styles.connectedDemo : styles.connectedGreen]}>
                  {isDemoMode ? 'DEMO MODE' : 'CONNECTED'}
                </Text>
              </View>
            </View>

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceId}>{deviceName}</Text>
              <View style={styles.batteryRow}>
                <Ionicons
                  name={parseInt(battery) < 20 ? "battery-dead" : "battery-full"}
                  size={moderateScale(20)}
                  color={parseInt(battery) < 20 ? "#F44336" : "#4CAF50"}
                  style={styles.batteryIcon}
                />
                <Text style={styles.batteryText}>{battery} %</Text>
              </View>
            </View>

            <View style={styles.versionChip}>
              <Text style={styles.versionText}>
                {isDemoMode ? 'Demo Device ID' : `ID: ${connectedDevice?.id || 'Unknown ID'}`}
              </Text>
            </View>
          </View>

          {/* Extracted Data Summary */}
          <View style={styles.syncPanel}>
            <View style={styles.syncItem}>
              <Ionicons name="heart" size={moderateScale(20)} color="#E91E63" />
              <Text style={styles.syncValue}>{metrics.hr}</Text>
              <Text style={styles.syncLabel}>BPM</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.syncItem}>
              <Ionicons name="walk" size={moderateScale(20)} color="#2196F3" />
              <Text style={styles.syncValue}>{metrics.steps}</Text>
              <Text style={styles.syncLabel}>Steps</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View style={styles.grid}>
            <ActionCard
              onPress={() => {
                navigation.navigate('AutoMonitorScreen', { connectedDevice });
              }}
              title="Auto Health Monitor"
              icon={<MaterialCommunityIcons name="toggle-switch" size={moderateScale(28)} color="#23238E" />}
            />
            <ActionCard
              onPress={() => navigation.navigate('SOSContactMainScreen')}
              title="SOS Contact"
              icon={<Ionicons name="call-outline" size={moderateScale(28)} color="#23238E" />}
            />
            <ActionCard
              onPress={() => navigation.navigate('DeviceSettingsScreen', { connectedDevice })}
              title="Device Settings"
              icon={<Ionicons name="settings-outline" size={moderateScale(28)} color="#23238E" />}
            />
            <ActionCard
              onPress={() => navigation.navigate('GoalSettingScreen')}
              title="Goal Settings"
              icon={<MaterialCommunityIcons name="target" size={moderateScale(28)} color="#23238E" />}
            />
            <ActionCard
              onPress={() => navigation.navigate('ExerciseScreen')}
              title="Exercise"
              icon={<FontAwesome5 name="dumbbell" size={moderateScale(22)} color="#23238E" />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ActionCard({ title, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardIconWrap}>
        {icon}
      </View>
      <Text style={styles.cardText} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  deviceWrapper: {
    alignItems: 'center',
    marginTop: verticalScale(32),
  },
  deviceCircle: {
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B6BE8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F4FF',
  },
  deviceImg: {
    width: scale(120),
    height: scale(140),
  },
  connected: {
    marginTop: verticalScale(8),
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: moderateScale(12),
    letterSpacing: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  deviceId: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1E2A78',
    marginRight: scale(12),
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryIcon: {
    marginRight: scale(4),
  },
  batteryText: {
    fontSize: moderateScale(14),
    color: '#333',
    fontWeight: '600',
  },
  versionChip: {
    backgroundColor: '#F5F7FF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    marginTop: verticalScale(12),
  },
  versionText: {
    fontSize: moderateScale(13),
    color: '#666',
  },
  syncPanel: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FB',
    marginHorizontal: wp(5),
    marginTop: verticalScale(30),
    padding: scale(20),
    borderRadius: scale(20),
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  syncItem: {
    alignItems: 'center',
    flex: 1,
  },
  syncValue: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#1E2A78',
    marginTop: verticalScale(8),
  },
  syncLabel: {
    fontSize: moderateScale(12),
    color: '#666',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: scale(40),
    backgroundColor: '#E0E0E0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginTop: verticalScale(40),
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardIconWrap: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  cardText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  // Demo Mode Styles
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(16),
    marginHorizontal: wp(5),
    marginTop: verticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  demoBannerText: {
    fontSize: moderateScale(13),
    color: '#E65100',
    fontWeight: '600',
    marginLeft: scale(8),
  },
  deviceCircleDemo: {
    borderColor: '#FFE0B2',
    shadowColor: '#FF9800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
    marginTop: verticalScale(8),
  },
  statusBadgeConnected: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeDemo: {
    backgroundColor: '#FFF3E0',
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: scale(6),
  },
  statusDotConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDotDemo: {
    backgroundColor: '#FF9800',
  },
  connectedGreen: {
    color: '#2E7D32',
  },
  connectedDemo: {
    color: '#E65100',
  },
});
