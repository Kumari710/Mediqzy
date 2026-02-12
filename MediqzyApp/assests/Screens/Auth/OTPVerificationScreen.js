import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { verifyOtpCode, signUp } from '../../Utils/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPVerificationScreen = ({ navigation, route }) => {
  const {
    username = '',
    email = '',
    password = '',
    confirmation = null,
    generatedCode = '', // Code from signup screen
    flow = 'signup'
  } = route.params || {};

  const [currentCode, setCurrentCode] = useState(generatedCode);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Firebase uses 6 digits
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      if (flow === 'signup_phone' && confirmation) {
        // Phone number verification with Firebase
        const result = await verifyOtpCode(confirmation, otpString, {
          firstName: username,
          fullName: username,
        });
        if (result.success) {
          navigation.replace('Success', { flow: 'signup' });
        } else {
          Alert.alert('Verification Failed', result.error);
        }
      } else if (flow === 'signup' && email && password) {
        // 1. Verify the OTP first
        if (otpString !== currentCode) {
          Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
          setLoading(false);
          return;
        }

        // 2. Email signup - Register with Firebase after OTP verification
        const firebaseResult = await signUp(email, password, {
          firstName: username,
          fullName: username,
          registeredAt: new Date().toISOString(),
        });

        if (firebaseResult.success) {
          // Also save to local storage for offline fallback
          const registeredUsersData = await AsyncStorage.getItem('@registered_users');
          const registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];
          registeredUsers.push({
            username: username,
            email: email,
            password: password,
            registeredAt: new Date().toISOString(),
          });
          await AsyncStorage.setItem('@registered_users', JSON.stringify(registeredUsers));

          navigation.replace('Success', { flow: 'signup' });
        } else {
          Alert.alert('Registration Failed', firebaseResult.error || 'Could not create account');
        }
      } else {
        // Legacy flow - just navigate
        navigation.replace('Success', { flow });
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <View style={styles.illustrationContainer}>
              <Image source={require('../../images/doctor.png')} style={styles.doctorImage} resizeMode="contain" />
            </View>
            <Text style={styles.brandName}>Smart Health</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
            <Text style={styles.contact}>{email}</Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="numeric"
                  editable={!loading}
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive code? </Text>
              <TouchableOpacity
                disabled={!canResend || loading}
                onPress={async () => {
                  const { generateOTP, sendOTP } = require('../../Utils/otpService');
                  const newCode = generateOTP();
                  const sent = await sendOTP(email, newCode);
                  if (sent) {
                    setCurrentCode(newCode);
                    setTimer(60);
                    setCanResend(false);
                    setOtp(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                  }
                }}
              >
                <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                  {canResend ? 'Resend now' : `Resend in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: wp(4), paddingVertical: hp(1) },
  scrollContent: { flexGrow: 1 },
  headerContainer: { alignItems: 'center', paddingBottom: hp(1) },
  illustrationContainer: { width: scale(140), height: scale(140) },
  doctorImage: { width: '100%', height: '100%' },
  brandName: { fontSize: moderateScale(22), fontWeight: '700', color: '#1e3a8a', marginTop: verticalScale(5) },
  formSection: { flex: 1, paddingHorizontal: wp(6), paddingTop: hp(2), alignItems: 'center' },
  title: { fontSize: moderateScale(26), fontWeight: '700', color: '#1a1a2e', marginBottom: verticalScale(10) },
  subtitle: { fontSize: moderateScale(14), color: '#64748B', textAlign: 'center' },
  contact: { fontSize: moderateScale(16), fontWeight: '600', color: '#1a1a2e', marginTop: verticalScale(5), marginBottom: verticalScale(30) },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: verticalScale(30) },
  otpInput: { width: scale(45), height: verticalScale(50), borderWidth: 2, borderColor: '#e0e0e0', borderRadius: scale(10), fontSize: moderateScale(20), fontWeight: '700', textAlign: 'center', color: '#1a1a2e', marginHorizontal: scale(4) },
  otpInputFilled: { borderColor: '#1e3a8a' },
  resendContainer: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: moderateScale(14), color: '#64748B' },
  resendLink: { fontSize: moderateScale(14), color: '#1e5a96', fontWeight: '700' },
  resendLinkDisabled: { color: '#94A3B8' },
  bottomSection: { paddingHorizontal: wp(6), paddingBottom: hp(5) },
  button: { backgroundColor: '#1e3a8a', borderRadius: scale(30), paddingVertical: verticalScale(16), alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '700' },
});

export default OTPVerificationScreen;
