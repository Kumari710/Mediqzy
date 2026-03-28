import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function BookingSuccessScreen({ navigation }) {
  // Auto-navigate after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ConsultationScreen');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={moderateScale(60)} color="#fff" />
        </View>
      </View>
      <Text style={styles.title}>Booking Successful</Text>
      <Text style={styles.subtitle}>
        Appointment has been successfully scheduled. After receiving confirmation, please proceed to complete the payment process.
      </Text>
      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('ConsultationScreen')}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23238E', alignItems: 'center', justifyContent: 'center', padding: wp(6) },
  iconWrap: { marginBottom: verticalScale(32), marginTop: verticalScale(-80) },
  checkCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: moderateScale(28), fontWeight: '700', textAlign: 'center', marginBottom: verticalScale(18) },
  subtitle: { color: '#fff', fontSize: moderateScale(16), textAlign: 'center', paddingHorizontal: wp(8), opacity: 0.9, lineHeight: moderateScale(24) },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: wp(15),
    marginTop: verticalScale(40),
  },
  doneBtnText: {
    color: '#23238E',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
});

