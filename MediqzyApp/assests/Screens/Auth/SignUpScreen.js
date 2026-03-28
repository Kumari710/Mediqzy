import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUp, signInWithPhoneNumber, sendEmailVerificationLink } from '../../Utils/firebaseAuth';
import { generateOTP, sendOTP } from '../../Utils/otpService';

import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

// AsyncStorage Keys for Registration
const STORAGE_KEYS = {
  REGISTERED_USERS: '@registered_users',
  PENDING_REGISTRATION: '@pending_registration',
};

const SignUpScreen = ({ navigation }) => {
  const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^\d{10}$/;
    return emailRegex.test(email);
  };

  // Check if user is already registered
  const checkExistingUser = async (userEmail) => {
    try {
      const registeredUsers = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        return users.some(user => user.email.toLowerCase() === userEmail.toLowerCase());
      }
      return false;
    } catch (error) {
      console.log('Error checking existing user:', error);
      return false;
    }
  };

  // Save pending registration data (before OTP verification)
  const savePendingRegistration = async () => {
    try {
      const pendingData = {
        username: username,
        email: email,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REGISTRATION, JSON.stringify(pendingData));
      return true;
    } catch (error) {
      console.log('Error saving pending registration:', error);
      return false;
    }
  };

  const handleGetOTP = async () => {
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!username.trim()) {
      setUsernameError('Please enter a username');
      return;
    }

    if (!email.trim()) {
      setEmailError(authMode === 'email' ? 'Email is required' : 'Mobile number is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(authMode === 'email' ? 'Please enter a valid email' : 'Please enter a valid mobile number');
      return;
    }

    if (authMode === 'email') {
      if (!password) {
        setPasswordError('Password is required');
        return;
      }

      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }

      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password');
        return;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      setLoading(true);
      const isActuallyEmail = email.includes('@');

      if (isActuallyEmail) {
        // OPTION 1: Firebase Email Link
        const result = await sendEmailVerificationLink(email);
        setLoading(false);
        if (result.success) {
          Alert.alert(
            'Link Sent!',
            `A sign-in link has been sent to ${email}. Please check your inbox and click the link to complete registration.`,
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        // OPTION 2: Firebase Phone SMS OTP
        // Ensure phone number starts with country code for Firebase
        const formattedPhone = email.startsWith('+') ? email : `+91${email}`;
        const result = await signInWithPhoneNumber(formattedPhone);
        setLoading(false);

        if (result.success) {
          navigation.navigate('OTPVerification', {
            username,
            email: formattedPhone,
            confirmation: result.confirmation,
            flow: 'signup_phone'
          });
        } else {
          Alert.alert('SMS Error', result.error);
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Doctor Image */}
        <View style={styles.headerContainer}>
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../images/doctor.png')}
              style={styles.doctorImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>Smart Health</Text>
        </View>

        {/* Sign Up Form */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Sign Up!</Text>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, authMode === 'email' && styles.activeTab]}
              onPress={() => {
                setAuthMode('email');
                setEmail('');
                setEmailError('');
              }}
            >
              <Text style={[styles.tabText, authMode === 'email' && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, authMode === 'phone' && styles.activeTab]}
              onPress={() => {
                setAuthMode('phone');
                setEmail('');
                setEmailError('');
              }}
            >
              <Text style={[styles.tabText, authMode === 'phone' && styles.activeTabText]}>Mobile</Text>
            </TouchableOpacity>
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name / Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              editable={!loading}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>

          {/* Email/Mobile Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{authMode === 'email' ? 'Email Id' : 'Mobile Number'}</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder={authMode === 'email' ? 'example@mail.com' : 'Mobile number'}
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType={authMode === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {authMode === 'email' && (
            <>
              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={moderateScale(20)} color="#999" style={styles.lockIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={moderateScale(20)}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.passwordContainer, confirmPasswordError && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={moderateScale(20)} color="#999" style={styles.lockIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError('');
                    }}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={moderateScale(20)}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
              </View>
            </>
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGetOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Get OTP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.signInLink}>sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: hp(4),
    paddingBottom: hp(1),
    backgroundColor: '#FFFFFF',
  },
  illustrationContainer: {
    width: scale(140),
    height: scale(140),
  },
  doctorImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#1e3a8a',
    marginTop: verticalScale(5),
  },
  formSection: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(20),
    backgroundColor: '#F3F4F6',
    borderRadius: scale(10),
    padding: scale(4),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: scale(8),
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#1e3a8a',
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: verticalScale(8),
  },
  input: {
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: scale(10),
    paddingHorizontal: scale(15),
    fontSize: moderateScale(16),
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: scale(10),
    paddingHorizontal: scale(15),
    backgroundColor: '#fff',
  },
  lockIcon: {
    marginRight: scale(10),
  },
  passwordInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#000',
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
    paddingTop: hp(2),
  },
  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: scale(30),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2.5),
  },
  signInText: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  signInLink: {
    fontSize: moderateScale(14),
    color: '#1e5a96',
    fontWeight: '600',
  },
});

export default SignUpScreen;
