import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const deviceImages = {
  watch: require('../../images/smartwatch.png'),
  band: require('../../images/SmartBand.png'),
  ring: require('../../images/SmartRing.png'),
};

const deviceNames = {
  watch: 'Smart Watch',
  band: 'Smart Band',
  ring: 'Smart Ring',
};

export default function DevicePairingScreen({ navigation, route }) {
  const [deviceType, setDeviceType] = useState('watch');

  useEffect(() => {
    if (route?.params?.device) {
      setDeviceType(route.params.device);
    }
  }, [route?.params?.device]);

  // Handle Connect Device - shows not available message
  const handleConnectDevice = () => {
    Alert.alert(
      'Connection Not Available',
      'Bluetooth device connection is not available at this time. Please try again later or continue without connection to explore demo features.',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Continue Demo',
          onPress: handleContinueWithoutConnection,
          style: 'cancel'
        }
      ]
    );
  };

  // Handle Continue Without Connection - navigate to device details
  const handleContinueWithoutConnection = () => {
    navigation.navigate('DeviceDetailsScreen', {
      device: {
        type: deviceType,
        name: deviceNames[deviceType] || 'Smart Watch',
        connected: false,
        demoMode: true,
      }
    });
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
          <Text style={styles.headerTitle}>Device Pairing</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.centerContent}>
            {/* Device Image Container */}
            <View style={styles.imageContainer}>
              <Image
                source={deviceImages[deviceType]}
                style={styles.deviceImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.bigTitle}>Smart Devices Just for You</Text>
            <Text style={styles.subtitle}>
              Tracking your activity today for a healthier tomorrow. Connect your device to start tracking.
            </Text>

            {/* Connection Status Badge */}
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Device not connected</Text>
            </View>

            {/* Connect Device Button */}
            <TouchableOpacity
              style={styles.connectButton}
              activeOpacity={0.8}
              onPress={handleConnectDevice}
            >
              <Ionicons name="bluetooth" size={moderateScale(22)} color="#fff" style={styles.btnIcon} />
              <Text style={styles.connectButtonText}>Connect Device</Text>
            </TouchableOpacity>

            {/* Continue Without Connection Button */}
            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.8}
              onPress={handleContinueWithoutConnection}
            >
              <Ionicons name="play-circle-outline" size={moderateScale(22)} color="#23238E" style={styles.btnIcon} />
              <Text style={styles.skipButtonText}>Continue Without Connection</Text>
            </TouchableOpacity>

            {/* Info Note */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={moderateScale(18)} color="#666" />
              <Text style={styles.infoText}>
                Without a connected device, you can still explore demo health data and features.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingBottom: hp(5),
  },
  imageContainer: {
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(32),
    borderWidth: 3,
    borderColor: '#E8EEFF',
  },
  deviceImage: {
    width: scale(130),
    height: scale(130),
  },
  bigTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#23238E',
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(22),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    marginBottom: verticalScale(28),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#FF9800',
    marginRight: scale(8),
  },
  statusText: {
    fontSize: moderateScale(13),
    color: '#E65100',
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    backgroundColor: '#23238E',
    borderRadius: scale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: verticalScale(14),
  },
  connectButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  skipButton: {
    flexDirection: 'row',
    backgroundColor: '#F0F4FF',
    borderRadius: scale(14),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#D4DFFF',
  },
  skipButtonText: {
    color: '#23238E',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: scale(10),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F7FA',
    padding: scale(14),
    borderRadius: scale(12),
    marginTop: verticalScale(24),
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: '#666',
    marginLeft: scale(10),
    lineHeight: moderateScale(18),
  },
});

