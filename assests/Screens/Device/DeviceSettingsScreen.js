import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function DeviceSettingsScreen({ navigation }) {
  const [weather, setWeather] = useState(false);
  const [findPhone, setFindPhone] = useState(false);
  const [wristSense, setWristSense] = useState(false);
  const [timeFormat, setTimeFormat] = useState('12h');
  const [tempUnit, setTempUnit] = useState('Km');
  const [distanceUnit, setDistanceUnit] = useState('Km');
  const [sedentaryAlert, setSedentaryAlert] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Settings</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('GoalSettingScreen')}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Smart Notification</Text>
              <Ionicons name="chevron-forward" size={moderateScale(18)} color="#888" />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Weather</Text>
              <Switch
                value={weather}
                onValueChange={setWeather}
                trackColor={{ false: "#D1D1D1", true: "#23238E" }}
                thumbColor={weather ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="phone-portrait-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Find Phone</Text>
              <Switch
                value={findPhone}
                onValueChange={setFindPhone}
                trackColor={{ false: "#D1D1D1", true: "#23238E" }}
                thumbColor={findPhone ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="watch-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Wrist Sense</Text>
              <Switch
                value={wristSense}
                onValueChange={setWristSense}
                trackColor={{ false: "#D1D1D1", true: "#23238E" }}
                thumbColor={wristSense ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Time Format</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, timeFormat === '12h' && styles.toggleBtnActive]}
                  onPress={() => setTimeFormat('12h')}
                >
                  <Text style={[styles.toggleBtnText, timeFormat === '12h' && styles.toggleBtnTextActive]}>12h</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, timeFormat === '24h' && styles.toggleBtnActive]}
                  onPress={() => setTimeFormat('24h')}
                >
                  <Text style={[styles.toggleBtnText, timeFormat === '24h' && styles.toggleBtnTextActive]}>24h</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="thermometer-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Temperature Unit</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, tempUnit === 'Km' && styles.toggleBtnActive]}
                  onPress={() => setTempUnit('Km')}
                >
                  <Text style={[styles.toggleBtnText, tempUnit === 'Km' && styles.toggleBtnTextActive]}>°C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, tempUnit === 'Mile' && styles.toggleBtnActive]}
                  onPress={() => setTempUnit('Mile')}
                >
                  <Text style={[styles.toggleBtnText, tempUnit === 'Mile' && styles.toggleBtnTextActive]}>°F</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SetLanguageScreen')}>
              <View style={styles.iconCircle}>
                <Ionicons name="language-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Language</Text>
              <Ionicons name="chevron-forward" size={moderateScale(18)} color="#888" />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="walk-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Distance Unit</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleBtn, distanceUnit === 'Km' && styles.toggleBtnActive]}
                  onPress={() => setDistanceUnit('Km')}
                >
                  <Text style={[styles.toggleBtnText, distanceUnit === 'Km' && styles.toggleBtnTextActive]}>Km</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, distanceUnit === 'Mile' && styles.toggleBtnActive]}
                  onPress={() => setDistanceUnit('Mile')}
                >
                  <Text style={[styles.toggleBtnText, distanceUnit === 'Mile' && styles.toggleBtnTextActive]}>Mile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-circle-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Sedentary Alert</Text>
              <Switch
                value={sedentaryAlert}
                onValueChange={setSedentaryAlert}
                trackColor={{ false: "#D1D1D1", true: "#23238E" }}
                thumbColor={sedentaryAlert ? "#fff" : "#f4f3f4"}
              />
            </View>

            <TouchableOpacity style={styles.row} onPress={() => { }}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-download-outline" size={moderateScale(22)} color="#23238E" />
              </View>
              <Text style={styles.label}>Firmware Update (OTA)</Text>
              <Ionicons name="chevron-forward" size={moderateScale(18)} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.noBorder]} onPress={() => navigation.navigate('FactoryResetScreen')}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFEEED' }]}>
                <Ionicons name="refresh-outline" size={moderateScale(22)} color="#FF3B30" />
              </View>
              <Text style={[styles.label, { color: '#FF3B30' }]}>Factory Reset</Text>
              <Ionicons name="chevron-forward" size={moderateScale(18)} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB'
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
    padding: scale(4)
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333'
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    marginHorizontal: wp(4),
    marginTop: verticalScale(20),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  label: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#333',
    fontWeight: '600'
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: scale(8),
    padding: scale(2),
  },
  toggleBtn: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(6),
  },
  toggleBtnActive: {
    backgroundColor: '#23238E',
    elevation: 2,
  },
  toggleBtnText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: moderateScale(12),
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
});