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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { sendPasswordResetEmail } from '../../Utils/firebaseAuth';
import { Alert } from 'react-native';

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^\d{10}$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordResetEmail(email.trim());
      setLoading(false);
      if (result.success) {
        Alert.alert(
          'Email Sent',
          'A password reset link has been sent to your email address.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset link.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
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

          {/* Forgot Password Form */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Forget Password!</Text>
            <Text style={styles.subtitle}>Enter your email to reset password</Text>

            {/* Email/Mobile Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number / Email Id</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Mobile number / Email Id"
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
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Send Reset Link'}
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
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: hp(4),
    paddingBottom: hp(1),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
  },
  illustrationContainer: {
    width: scale(120),
    height: scale(120),
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
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: '#888',
    textAlign: 'center',
    marginBottom: hp(2.5),
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
    height: verticalScale(45),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: scale(10),
    paddingHorizontal: scale(15),
    fontSize: moderateScale(15),
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
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(2.5),
    paddingTop: hp(1),
  },
  button: {
    backgroundColor: '#1e3a8a',
    borderRadius: scale(25),
    paddingVertical: verticalScale(14),
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

export default ForgotPasswordScreen;
