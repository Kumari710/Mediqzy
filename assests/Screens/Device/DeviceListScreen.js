import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function DeviceListScreen({ navigation }) {
  const devices = [
    { name: 'Smart Watch', type: 'watch' },
    { name: 'Smart Ring', type: 'ring' },
    { name: 'Smart Band', type: 'band' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Devices</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Select Your Device</Text>
          <Text style={styles.description}>
            Choose one of the three devices to automatically track your activity and deliver accurate results.
          </Text>

          <View style={styles.deviceList}>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.name}
                style={styles.deviceCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DevicePairingScreen', { device: device.type })}
              >
                <View style={styles.deviceIconBox}>
                  <Ionicons
                    name={device.type === 'watch' ? 'watch' : device.type === 'ring' ? 'ellipse-outline' : 'barcode-outline'}
                    size={moderateScale(28)}
                    color="#23238E"
                  />
                </View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#23238E" />
              </TouchableOpacity>
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
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(4),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#23238E',
    marginBottom: verticalScale(12),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#666',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(32),
  },
  deviceList: {
    gap: verticalScale(16),
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  deviceIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  deviceName: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#333',
    fontWeight: '600',
  },
});