import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { signOut } from '../../Utils/firebaseAuth';
import { signOutFromGoogle } from '../../Utils/googleAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { id: 'viewProfile', label: 'View Profile', icon: 'person-outline', screen: 'PersonalInfoScreen' },
  { id: 'dataShare', label: 'Data Share', icon: 'share-outline', screen: 'ThirdPartyConnectScreen' },
  { id: 'myRecords', label: 'My Records', icon: 'document-text-outline', screen: 'MyOrdersScreen' },
  { id: 'myReports', label: 'My Reports', icon: 'flask-outline', screen: 'MyReportsScreen' },
  { id: 'doctorPortal', label: 'Doctor Portal', icon: 'medical-outline', screen: 'DoctorAppointmentsScreen' },
  { id: 'helpSupport', label: 'Help & Support', icon: 'headset-outline', screen: 'AboutUsScreen' },
  { id: 'aboutUs', label: 'About Us', icon: 'information-circle-outline', screen: 'AboutUsScreen' },
  { id: 'terms', label: 'Terms & Conditions', icon: 'document-outline', screen: 'TermsConditionsScreen' },
  { id: 'privacy', label: 'Privacy policy', icon: 'shield-outline', screen: 'PrivacyPolicyScreen' },
  { id: 'logout', label: 'Log Out', icon: 'log-out-outline', screen: null },
];

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from Firebase and Google
              await signOut();
              await signOutFromGoogle();

              // Clear local session data
              await AsyncStorage.multiRemove([
                '@is_logged_in',
                '@user_data',
                '@firebase_user_cache',
              ]);

              // Navigate to Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (item) => {
    if (item.id === 'logout') {
      handleLogout();
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../images/IndianDoctor.png')}
            style={styles.avatar}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <Ionicons name={item.icon} size={moderateScale(22)} color={item.id === 'logout' ? '#DC2626' : '#23238E'} />
              <Text style={[styles.menuLabel, item.id === 'logout' && styles.logoutLabel]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="#888" />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#1A1A2E' },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  avatar: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: scale(3),
    borderColor: '#23238E',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLabel: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#1A1A2E',
    marginLeft: scale(16),
    fontWeight: '500',
  },
  logoutLabel: {
    color: '#DC2626',
  },
});
