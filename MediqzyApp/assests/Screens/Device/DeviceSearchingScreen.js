import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import bluetoothService from '../../Utils/bluetoothService';

const deviceImages = {
  watch: require('../../images/smartwatch.png'),
  band: require('../../images/SmartBand.png'),
  ring: require('../../images/SmartRing.png'),
};

export default function DeviceSearchingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const deviceType = route?.params?.device || 'watch';

  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initBLE = async () => {
      await bluetoothService.init();
      startScan();
    };

    const discoveryListener = bluetoothService.onDeviceDiscovered((device) => {
      if (isMounted) {
        setDevices(prev => {
          const index = prev.findIndex(d => d.id === device.id);
          if (index > -1) {
            const newDevices = [...prev];
            newDevices[index] = device;
            return newDevices;
          }
          return [...prev, device];
        });
      }
    });

    const stopListener = bluetoothService.onScanStop(() => {
      if (isMounted) setIsScanning(false);
    });

    initBLE();

    return () => {
      isMounted = false;
      discoveryListener.remove();
      stopListener.remove();
      bluetoothService.stopScan();
    };
  }, []);

  const startScan = async () => {
    setDevices([]);
    setIsScanning(true);
    try {
      const found = await bluetoothService.startScan(10);
      if (found.length === 0) {
        Alert.alert(
          'Fire-Boltt 108 Not Found?',
          'Common fixes for Fire-Boltt:\n\n1. DISCONNECT from "Da Fit" / "FitcloudPro" app first. If it\'s connected there, it stays hidden here.\n2. In phone Settings > Bluetooth, look for "Fire-Boltt" or "FB 108" and click "Forget/Unpair".\n3. Restart your watch and phone and try again.',
          [{ text: 'Got it' }]
        );
      }
    } catch (error) {
      setIsScanning(false);
      const msg = error.message || 'Failed to start scanning.';
      Alert.alert('Scan Problem', msg);
    }
  };

  const handleConnect = async (device) => {
    setConnectingId(device.id);
    const connected = await bluetoothService.connect(device.id);
    setConnectingId(null);

    if (connected) {
      console.log('[Connecting] Successfully connected to:', device.name);
      // Use the device object returned from connect which might have more info
      const deviceData = {
        id: device.id,
        name: device.name || 'Smart Device',
        ...device,
        ...connected
      };
      navigation.replace('DeviceDetailsScreen', { device: deviceType, connectedDevice: deviceData });
    } else {
      Alert.alert('Connection Failed', `Could not connect to ${device.name}. Please try again.`);
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleConnect(item)}
      disabled={connectingId !== null}
    >
      <View style={styles.deviceIcon}>
        <Ionicons name="bluetooth" size={moderateScale(24)} color="#23238E" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      {connectingId === item.id ? (
        <ActivityIndicator size="small" color="#23238E" />
      ) : (
        <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect {deviceType}</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <View style={styles.content}>
          {!isScanning && devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ImageBackground
                source={require('../../images/device-illustration.png')}
                style={styles.illustration}
                resizeMode="contain"
              >
                <Image
                  source={deviceImages[deviceType]}
                  style={styles.deviceImg}
                  resizeMode="contain"
                />
              </ImageBackground>
              <Text style={styles.title}>No Device Available</Text>
              <Text style={styles.subtitle}>
                We couldn't find any {deviceType} nearby. Please make sure your device is turned on, discoverable, and within range.
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startScan}>
                <Text style={styles.retryText}>Retry Scan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, width: '100%' }}>
              <View style={styles.topInfo}>
                <ImageBackground
                  source={require('../../images/device-illustration.png')}
                  style={styles.smallIllustration}
                  resizeMode="contain"
                >
                  <Image source={deviceImages[deviceType]} style={styles.smallDeviceImg} resizeMode="contain" />
                </ImageBackground>
                <View style={styles.textContainer}>
                  <Text style={styles.scanTitle}>
                    {isScanning ? 'Searching...' : 'Found Devices'}
                  </Text>
                  <Text style={styles.scanSubtitle}>
                    {isScanning ? 'Looking for nearby Bluetooth devices' : 'Select your device to connect'}
                  </Text>
                </View>
                {isScanning && <ActivityIndicator color="#23238E" size="small" />}
              </View>

              <FlatList
                data={devices}
                renderItem={renderDevice}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  backBtn: { width: scale(40), padding: scale(4) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222', textTransform: 'capitalize' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: wp(5) },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  illustration: { width: scale(180), height: scale(180), alignItems: 'center', justifyContent: 'center' },
  deviceImg: { width: scale(70), height: scale(70) },
  title: { fontSize: moderateScale(22), fontWeight: 'bold', color: '#23238E', marginTop: verticalScale(24) },
  subtitle: { fontSize: moderateScale(14), color: '#666', textAlign: 'center', marginTop: verticalScale(12), lineHeight: moderateScale(20) },
  retryBtn: { backgroundColor: '#23238E', paddingHorizontal: scale(32), paddingVertical: verticalScale(12), borderRadius: scale(25), marginTop: verticalScale(30) },
  retryText: { color: '#fff', fontWeight: 'bold' },
  topInfo: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(2), width: '100%', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  smallIllustration: { width: scale(60), height: scale(60), alignItems: 'center', justifyContent: 'center' },
  smallDeviceImg: { width: scale(25), height: scale(25) },
  textContainer: { flex: 1, marginLeft: scale(12) },
  scanTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#23238E' },
  scanSubtitle: { fontSize: moderateScale(13), color: '#888', marginTop: verticalScale(2) },
  listContent: { paddingVertical: hp(2) },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: moderateScale(15), fontWeight: '700', color: '#334155' },
  deviceId: { fontSize: moderateScale(12), color: '#94A3B8', marginTop: verticalScale(2) },
});
