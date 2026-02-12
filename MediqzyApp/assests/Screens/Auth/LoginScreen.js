import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, getSavedCredentials } from '../../Utils/firebaseAuth';
import { signInWithGoogle } from '../../Utils/googleAuthService';

// AsyncStorage Keys
const STORAGE_KEYS = {
  REMEMBER_ME: '@remember_me',
  SAVED_EMAIL: '@saved_email',
  SAVED_PASSWORD: '@saved_password',
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  IS_LOGGED_IN: '@is_logged_in',
  REGISTERED_USERS: '@registered_users',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load saved credentials on component mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  // Function to load saved credentials from AsyncStorage
  const loadSavedCredentials = async () => {
    try {
      const savedRememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      if (savedRememberMe === 'true') {
        const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
        const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);

        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  // Function to save credentials to AsyncStorage
  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email);
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password);
      } else {
        // Clear saved credentials if Remember Me is not checked
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.REMEMBER_ME,
          STORAGE_KEYS.SAVED_EMAIL,
          STORAGE_KEYS.SAVED_PASSWORD,
        ]);
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  // Function to validate user credentials against registered users
  const validateUserCredentials = async (userEmail, userPassword) => {
    try {
      const registeredUsersData = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);

      if (!registeredUsersData) {
        // No registered users found
        return { success: false, error: 'No account found. Please sign up first.' };
      }

      const registeredUsers = JSON.parse(registeredUsersData);

      // Find user by email (case-insensitive)
      const user = registeredUsers.find(
        u => u.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (!user) {
        return { success: false, error: 'No account found with this email/mobile. Please sign up first.' };
      }

      // Check password
      if (user.password !== userPassword) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // Credentials are valid
      return { success: true, user: user };
    } catch (error) {
      console.log('Error validating credentials:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  // Function to save user session after successful login
  const saveUserSession = async (userData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      // You can also save a token if your API returns one
      // await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, userData.token);
    } catch (error) {
      console.log('Error saving user session:', error);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^\d{10}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions to continue');
      return;
    }

    try {
      setLoading(true);

      // Try Firebase Authentication first
      const firebaseResult = await signIn(email, password, rememberMe);

      if (firebaseResult.success) {
        // Firebase login successful
        await saveCredentials();

        const userData = {
          uid: firebaseResult.user.uid,
          email: firebaseResult.user.email,
          loginTime: new Date().toISOString(),
        };

        await saveUserSession(userData);
        setLoading(false);
        navigation.replace('Success', { flow: 'login' });
        return;
      }

      // If Firebase fails, try local validation as fallback
      const validationResult = await validateUserCredentials(email, password);

      if (!validationResult.success) {
        setLoading(false);
        // Show Firebase error or local error
        const errorMsg = firebaseResult.error || validationResult.error;
        if (errorMsg.includes('password') || errorMsg.includes('Password')) {
          setPasswordError(errorMsg);
        } else {
          setEmailError(errorMsg);
        }
        return;
      }

      // Local validation successful - save credentials
      await saveCredentials();

      const userData = {
        email: validationResult.user.email,
        loginTime: new Date().toISOString(),
        registeredAt: validationResult.user.registeredAt,
      };

      await saveUserSession(userData);
      setLoading(false);
      navigation.replace('Success', { flow: 'login' });
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An error occurred during login');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      if (result.success) {
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          loginTime: new Date().toISOString(),
          isSocial: true,
        };
        await saveUserSession(userData);
        setLoading(false);
        navigation.replace('Success', { flow: 'login' });
      } else {
        setLoading(false);
        if (result.error !== 'Sign in cancelled') {
          Alert.alert('Google Login Error', result.error);
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An error occurred during Google Sign-In');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with App Logo */}
          <View style={styles.headerContainer}>
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../../images/doctor.png')}
                style={styles.doctorImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandName}>MediQzy</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.loginTitle}>User Login</Text>
            <Text style={styles.welcomeText}>Hi, Welcome Back!</Text>

            {/* Email/Mobile Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Id</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email Id"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

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

            {/* Remember Me and Forgot Password */}
            <View style={styles.rememberForgotContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => !loading && setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotPasswordLink}>Forget Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => !loading && setAgreeToTerms(!agreeToTerms)}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>I have read and agreed to </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Terms & Conditions')}
                disabled={loading}
              >
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Loading...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or login with</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={moderateScale(20)} color="#DB4437" style={{ marginRight: scale(10) }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  loginTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: moderateScale(14),
    color: '#888',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  inputGroup: {
    marginBottom: hp(2),
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
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  checkboxChecked: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  checkmark: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: moderateScale(14),
    color: '#333',
  },
  forgotPasswordLink: {
    fontSize: moderateScale(14),
    color: '#1e5a96',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: hp(2.5),
    marginBottom: hp(2.5),
  },
  termsLink: {
    fontSize: moderateScale(14),
    color: '#1e5a96',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(5),
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: scale(30),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(3),
  },
  signUpText: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  signUpLink: {
    fontSize: moderateScale(14),
    color: '#1e5a96',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2.5),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: scale(12),
    color: '#6B7280',
    fontSize: moderateScale(14),
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(30),
    paddingVertical: verticalScale(14),
    marginBottom: hp(1),
  },
  googleIcon: {
    width: scale(20),
    height: scale(20),
    marginRight: scale(10),
  },
  googleButtonText: {
    fontSize: moderateScale(16),
    color: '#374151',
    fontWeight: '600',
  },
});

export default LoginScreen;
