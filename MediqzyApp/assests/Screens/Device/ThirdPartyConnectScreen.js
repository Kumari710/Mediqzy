import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const connectOptions = [
  {
    id: 'googleFit',
    name: 'Google Fit Connect',
    description: 'Share exercise & health data to Google fit',
    icon: 'googlefit',
    color: '#4285F4',
  },
  {
    id: 'strava',
    name: 'Starva',
    description: 'Share exercise data to Strava',
    icon: 'strava',
    color: '#FC4C02',
  },
];

export default function ThirdPartyConnectScreen({ navigation }) {
  const handleConnect = (optionId) => {
    // Handle connection logic
    console.log('Connecting to:', optionId);
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
          <Text style={styles.headerTitle}>Third Party Connect</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>External Apps</Text>
          <Text style={styles.description}>
            Sync your health data with other fitness platforms for a unified experience.
          </Text>

          <View style={styles.content}>
            {connectOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.connectCard}
                onPress={() => handleConnect(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {option.id === 'googleFit' ? (
                    <View style={styles.googleFitIcon}>
                      <View style={[styles.heart, { backgroundColor: '#EA4335' }]} />
                      <View style={[styles.heart, { backgroundColor: '#FBBC05', marginLeft: -scale(4) }]} />
                      <View style={[styles.heart, { backgroundColor: '#34A853', marginLeft: -scale(4) }]} />
                      <View style={[styles.heart, { backgroundColor: '#4285F4', marginLeft: -scale(4) }]} />
                    </View>
                  ) : (
                    <View style={styles.stravaIcon}>
                      <Text style={styles.stravaText}>S</Text>
                    </View>
                  )}
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#888" />
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
    backgroundColor: '#fff'
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
    color: '#333'
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
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
  content: {
    gap: verticalScale(16),
  },
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    backgroundColor: '#fff',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
    backgroundColor: '#F8F9FA',
    borderRadius: scale(12),
  },
  googleFitIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
  },
  stravaIcon: {
    width: scale(40),
    height: scale(40),
    backgroundColor: '#FC4C02',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stravaText: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(2),
  },
  optionDescription: {
    fontSize: moderateScale(13),
    color: '#888',
  },
});
