/**
 * Firebase Authentication Service
 * 
 * Provides authentication functions using Firebase Auth
 * Compatible with @react-native-firebase v23+
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys for local caching
const STORAGE_KEYS = {
    REMEMBER_ME: '@firebase_remember_me',
    SAVED_EMAIL: '@firebase_saved_email',
    USER_CACHE: '@firebase_user_cache',
};

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} additionalData - Additional user data
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signUp = async (email, password, additionalData = {}) => {
    try {
        // Create user with Firebase Auth
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        try {
            await firestore().collection('users').doc(user.uid).set({
                email: user.email,
                uid: user.uid,
                createdAt: firestore.FieldValue.serverTimestamp(),
                ...additionalData,
            });
        } catch (firestoreError) {
            console.warn('Firestore write failed (may not be enabled):', firestoreError);
        }

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        };
    } catch (error) {
        console.error('Firebase signUp error:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code),
        };
    }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember credentials
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signIn = async (email, password, rememberMe = false) => {
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Save remember me preference
        if (rememberMe) {
            await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
            await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email);
        } else {
            await AsyncStorage.multiRemove([STORAGE_KEYS.REMEMBER_ME, STORAGE_KEYS.SAVED_EMAIL]);
        }

        // Cache user data locally
        await cacheUserData(user);

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        };
    } catch (error) {
        console.error('Firebase signIn error:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code),
        };
    }
};

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const signOut = async () => {
    try {
        await auth().signOut();
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_CACHE);
        return { success: true };
    } catch (error) {
        console.error('Firebase signOut error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign in with phone number (send OTP)
 * @param {string} phoneNumber - Full phone number with country code
 * @returns {Promise<{success: boolean, confirmation?: object, error?: string}>}
 */
export const signInWithPhoneNumber = async (phoneNumber) => {
    try {
        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
        return { success: true, confirmation };
    } catch (error) {
        console.error('Firebase phone sign-in error:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code),
        };
    }
};

/**
 * Verify OTP code and update user profile
 * @param {object} confirmation - The confirmation object from signInWithPhoneNumber
 * @param {string} code - The 6-digit OTP code
 * @param {object} profileData - Optional profile data (username, etc)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const verifyOtpCode = async (confirmation, code, profileData = {}) => {
    try {
        const userCredential = await confirmation.confirm(code);
        const user = userCredential.user;

        // Create user profile in Database/Firestore if profileData exists
        if (profileData && Object.keys(profileData).length > 0) {
            try {
                const { updateData } = require('./firebaseDatabase');
                await updateData(`users/${user.uid}/profile`, {
                    uid: user.uid,
                    ...profileData,
                    updatedAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.warn('Profile update failed:', dbError);
            }
        }

        await cacheUserData(user);
        return {
            success: true,
            user: {
                uid: user.uid,
                phoneNumber: user.phoneNumber,
            },
        };
    } catch (error) {
        console.error('Firebase OTP verification error:', error);
        return {
            success: false,
            error: 'Invalid OTP code. Please try again.',
        };
    }
};

/**
 * Send a sign-in link to a user's email (Passwordless Sign-in)
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendEmailVerificationLink = async (email) => {
    try {
        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be whitelisted in the Firebase Console.
            url: 'https://mediqzyapp.page.link/finishSignUp',
            handleCodeInApp: true,
            android: {
                packageName: 'com.mediqzyapp',
                installApp: true,
                minimumVersion: '1',
            },
        };

        await auth().sendSignInLinkToEmail(email, actionCodeSettings);
        // Save the email locally so you don't have to ask the user for it again
        await AsyncStorage.setItem('@email_for_signin', email);

        return { success: true };
    } catch (error) {
        console.error('Email link error:', error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
};

/**
 * Check if the current link is a sign-in link
 */
export const isEmailSigninLink = (link) => {
    return auth().isSignInWithEmailLink(link);
};

/**
 * Complete sign-in with email link
 */
export const completeEmailSignIn = async (email, link) => {
    try {
        if (auth().isSignInWithEmailLink(link)) {
            const result = await auth().signInWithEmailLink(email, link);
            await cacheUserData(result.user);
            return { success: true, user: result.user };
        }
        return { success: false, error: 'Invalid sign-in link' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendPasswordResetEmail = async (email) => {
    try {
        await auth().sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Firebase password reset error:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code),
        };
    }
};

/**
 * Send email verification to current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendEmailVerification = async () => {
    try {
        const user = auth().currentUser;
        if (user) {
            await user.sendEmailVerification();
            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    } catch (error) {
        console.error('Firebase email verification error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current authenticated user
 * @returns {object|null} Current user or null
 */
export const getCurrentUser = () => {
    return auth().currentUser;
};

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
export const isLoggedIn = () => {
    return auth().currentUser !== null;
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - Callback function (user) => {}
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
    return auth().onAuthStateChanged(callback);
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Cache user data locally
 */
const cacheUserData = async (user) => {
    try {
        const userData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            lastLogin: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(userData));
    } catch (error) {
        console.error('Error caching user data:', error);
    }
};

/**
 * Get cached user data
 * @returns {Promise<object|null>}
 */
export const getCachedUserData = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_CACHE);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

/**
 * Get saved email for remember me feature
 * @returns {Promise<{rememberMe: boolean, email: string|null}>}
 */
export const getSavedCredentials = async () => {
    try {
        const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
        const email = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
        return {
            rememberMe: rememberMe === 'true',
            email: email,
        };
    } catch (error) {
        return { rememberMe: false, email: null };
    }
};

/**
 * Convert Firebase auth error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up first.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
            return 'Invalid credentials. Please check your email and password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/invalid-phone-number':
            return 'The phone number provided is incorrect. Please include the country code (e.g., +91).';
        case 'auth/quota-exceeded':
            return 'SMS quota exceeded. Please try again later.';
        case 'auth/captcha-check-failed':
            return 'Verification failed. Please try again.';
        case 'auth/billing-not-enabled':
            return 'SMS service is not enabled for this project. Please upgrade to Blaze plan or use test numbers in Firebase Console.';
        default:
            return 'An error occurred. Please try again.';
    }
};

// Export all functions
export default {
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    getCurrentUser,
    isLoggedIn,
    onAuthStateChanged,
    getCachedUserData,
    getSavedCredentials,
    signInWithPhoneNumber,
    verifyOtpCode,
};
