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
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

// Firebase Auth
import {
    signIn,
    getSavedCredentials,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from '../../Utils/firebaseAuth';
import { migrateLocalDataToFirebase } from '../../Utils/firebaseActivityStorage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Check authentication state and load saved credentials
    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged((user) => {
            if (user) {
                // User is already logged in, navigate to main app
                navigation.replace('Success', { flow: 'login' });
            }
            setInitializing(false);
        });

        // Load saved credentials
        loadSavedCredentials();

        return unsubscribe;
    }, []);

    // Function to load saved credentials
    const loadSavedCredentials = async () => {
        try {
            const { rememberMe: savedRememberMe, email: savedEmail } = await getSavedCredentials();
            if (savedRememberMe && savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        } catch (error) {
            console.log('Error loading saved credentials:', error);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');

        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
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

        setLoading(true);

        try {
            // Sign in with Firebase
            const result = await signIn(email.trim(), password, rememberMe);

            if (result.success) {
                // Migrate local data to Firebase (if any)
                await migrateLocalDataToFirebase();

                // Navigate to success/home
                navigation.replace('Success', { flow: 'login' });
            } else {
                // Show error
                if (result.error.toLowerCase().includes('password')) {
                    setPasswordError(result.error);
                } else {
                    setEmailError(result.error);
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword', { initialEmail: email });
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    // Show loading while checking auth state
    if (initializing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#1e3a8a" />
                <Text style={styles.initializingText}>Loading...</Text>
            </View>
        );
    }

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

                    {/* Login Form */}
                    <View style={styles.formSection}>
                        <Text style={styles.loginTitle}>User Login</Text>
                        <Text style={styles.welcomeText}>Hi, Welcome Back!</Text>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[styles.input, emailError && styles.inputError]}
                                placeholder="Enter your email"
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
                                <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
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
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
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
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initializingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
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
});

export default LoginScreen;
