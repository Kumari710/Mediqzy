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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

// Firebase Auth
import { signUp, sendEmailVerification, signInWithPhoneNumber } from '../../Utils/firebaseAuth';
import { saveUserProfile } from '../../Utils/firebaseDatabase';

const SignUpScreen = ({ navigation }) => {
    const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const hasMinLength = password.length >= 6;
        return { isValid: hasMinLength, hasMinLength };
    };

    const handleEmailSignUp = async () => {
        setError('');
        if (!email.trim() || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (!validateEmail(email)) {
            setError('Enter a valid email');
            return;
        }
        if (password.length < 6) {
            setError('Password must be 6+ chars');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords match');
            return;
        }

        setLoading(true);
        try {
            const result = await signUp(email.trim(), password, {
                displayName: email.split('@')[0],
            });
            if (result.success) {
                // Save initial profile to Realtime Database
                await saveUserProfile({
                    email: email.trim(),
                    displayName: email.split('@')[0],
                    createdAt: new Date().toISOString(),
                });

                await sendEmailVerification();
                Alert.alert(
                    'Success',
                    'Verification email sent. Please check your inbox.',
                    [{ text: 'Login', onPress: () => navigation.replace('Login') }]
                );
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneSignUp = async () => {
        setError('');
        // Remove all non-numeric characters except '+'
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');

        if (!cleaned) {
            setError('Please enter a phone number');
            return;
        }

        let finalPhone = cleaned;

        // Smart formatting for users who forget '+'
        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 10) {
                // Assume India
                finalPhone = `+91${cleaned}`;
            } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
                // Already has 91, just add +
                finalPhone = `+${cleaned}`;
            } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
                // Starts with 0 (Indian style), replace 0 with +91
                finalPhone = `+91${cleaned.substring(1)}`;
            } else {
                setError('Please include country code (e.g. +91 98765 43210)');
                return;
            }
        }

        // Final E.164 check
        if (finalPhone.length < 10) {
            setError('Phone number is too short');
            return;
        }

        setLoading(true);
        try {
            const result = await signInWithPhoneNumber(finalPhone);
            if (result.success) {
                navigation.navigate('OTPVerification', {
                    email: finalPhone,
                    confirmation: result.confirmation,
                    flow: 'signup_phone'
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to send SMS. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerContainer}>
                        <View style={styles.illustrationContainer}>
                            <Image source={require('../../images/doctor.png')} style={styles.doctorImage} resizeMode="contain" />
                        </View>
                        <Text style={styles.brandName}>Smart Health</Text>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.title}>Create Account</Text>

                        {/* Signup Method Tabs */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, signupMethod === 'email' && styles.activeTab]}
                                onPress={() => setSignupMethod('email')}
                            >
                                <Text style={[styles.tabText, signupMethod === 'email' && styles.activeTabText]}>Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, signupMethod === 'phone' && styles.activeTab]}
                                onPress={() => setSignupMethod('phone')}
                            >
                                <Text style={[styles.tabText, signupMethod === 'phone' && styles.activeTabText]}>Phone</Text>
                            </TouchableOpacity>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {signupMethod === 'email' ? (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="name@email.com"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#999" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                        />
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="+91 98765 43210"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <Text style={styles.hintText}>We'll send a 6-digit code to verify</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={signupMethod === 'email' ? handleEmailSignUp : handlePhoneSignUp}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
                        </TouchableOpacity>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1 },
    headerContainer: { alignItems: 'center', paddingTop: hp(4), paddingBottom: hp(2) },
    illustrationContainer: { width: scale(120), height: scale(120) },
    doctorImage: { width: '100%', height: '100%' },
    brandName: { fontSize: moderateScale(22), fontWeight: '700', color: '#1e3a8a', marginTop: verticalScale(5) },
    formSection: { flex: 1, paddingHorizontal: wp(6) },
    title: { fontSize: moderateScale(26), fontWeight: '700', color: '#1a1a2e', textAlign: 'center', marginBottom: verticalScale(20) },
    tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: scale(10), padding: scale(4), marginBottom: verticalScale(20) },
    tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: scale(8) },
    activeTab: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: scale(4) },
    tabText: { fontSize: moderateScale(14), color: '#64748B', fontWeight: '500' },
    activeTabText: { color: '#1e3a8a', fontWeight: '700' },
    inputGroup: { marginBottom: verticalScale(15) },
    label: { fontSize: moderateScale(14), fontWeight: '600', color: '#333', marginBottom: verticalScale(8) },
    inputContainer: { flexDirection: 'row', alignItems: 'center', height: verticalScale(55), borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: scale(12), paddingHorizontal: scale(15), backgroundColor: '#FAFAFA' },
    inputIcon: { marginRight: scale(12) },
    input: { flex: 1, fontSize: moderateScale(16), color: '#000' },
    button: { backgroundColor: '#1e3a8a', borderRadius: scale(30), paddingVertical: verticalScale(16), alignItems: 'center', marginTop: verticalScale(10) },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '700' },
    errorText: { color: '#EF4444', fontSize: moderateScale(12), marginBottom: verticalScale(10), textAlign: 'center' },
    hintText: { fontSize: moderateScale(12), color: '#64748B', marginTop: verticalScale(5), marginLeft: scale(5) },
    signInContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: hp(3), marginBottom: hp(5) },
    signInText: { fontSize: moderateScale(14), color: '#666' },
    signInLink: { fontSize: moderateScale(14), color: '#1e5a96', fontWeight: '700' },
});

export default SignUpScreen;
