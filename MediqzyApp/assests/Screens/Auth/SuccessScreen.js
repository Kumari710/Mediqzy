import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const SuccessScreen = ({ navigation, route }) => {
  const { flow = 'login' } = route.params || {};

  const handleContinue = () => {
    navigation.replace('HomeScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={moderateScale(50)} color="#FFFFFF" />
            </View>
          </View>

          {/* Success Text */}
          <Text style={styles.title}>Successful!</Text>
          <Text style={styles.subtitle}>
            {flow === 'signup'
              ? 'Your account has been\ncreated successfully!'
              : 'Your login was\nsuccessful!'
            }
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  iconContainer: {
    marginBottom: verticalScale(30),
  },
  iconCircle: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: verticalScale(15),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(8),
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: scale(30),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default SuccessScreen;
