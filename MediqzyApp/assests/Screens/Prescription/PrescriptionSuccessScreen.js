import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function PrescriptionSuccessScreen({ navigation }) {
  useEffect(() => {
    // Auto navigate back to LabTestsScreen after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('HomeScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark" size={moderateScale(60)} color="#fff" />
      </View>
      <Text style={styles.title}>Prescription submitted{'\n'}successfully!</Text>
      <Text style={styles.subtitle}>You will receive an{'\n'}update through e-mail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(10),
  },
  checkCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: verticalScale(16),
    lineHeight: moderateScale(38),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
});

