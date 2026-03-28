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

export default function PaymentSuccessScreen({ navigation, route }) {
  const type = route?.params?.type || 'lab';

  const handleTrack = () => {
    navigation.navigate(
      type === 'pharmacy'
        ? 'DeliveryStatusScreen'
        : 'LabTestDetailsScreen'
    );
  };

  const handleHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.45)" />
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark" size={moderateScale(42)} color="#4CAF50" />
        </View>

        <Text style={styles.title}>Payment Successful</Text>

        <Text style={styles.subtitle}>
          Your payment was completed successfully.
          {'\n'}You can track your order anytime.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={handleHome}
          >
            <Text style={styles.outlineText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleTrack}
          >
            <Text style={styles.primaryText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: wp(88),
    backgroundColor: '#fff',
    borderRadius: scale(24),
    paddingVertical: verticalScale(36),
    paddingHorizontal: scale(24),
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  iconWrapper: {
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(22),
  },

  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },

  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(30),
  },

  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
  },

  button: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
  },

  outlineButton: {
    borderWidth: 1.2,
    borderColor: '#1F2937',
  },

  outlineText: {
    color: '#1F2937',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: '#23238E',
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});
