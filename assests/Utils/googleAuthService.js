/**
 * Google Sign-In Service
 * 
 * Handles social authentication with Google accounts.
 */

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { GOOGLE_CONFIG } from './apiConfig';

/**
 * Configure Google Sign-In
 */
export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: GOOGLE_CONFIG.WEB_CLIENT_ID,
        offlineAccess: true,
    });
};

/**
 * Perform Google Sign-In and link with Firebase
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export const signInWithGoogle = async () => {
    try {
        if (GOOGLE_CONFIG.WEB_CLIENT_ID.includes('your-google')) {
            return { success: false, error: 'Google Client ID not configured in apiConfig.js' };
        }

        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices();

        // Get user ID token
        const userInfo = await GoogleSignin.signIn();
        const { idToken } = userInfo.data || {};

        if (!idToken) {
            throw new Error('No ID Token found');
        }

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const userCredential = await auth().signInWithCredential(googleCredential);

        return {
            success: true,
            user: userCredential.user
        };
    } catch (error) {
        console.error('Google Sign-In Error Detail:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        let errorMessage = `Google Sign-In Error (${error.code || 'unknown'}): ${error.message}`;
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            errorMessage = 'Sign in cancelled';
        } else if (error.code === statusCodes.IN_PROGRESS) {
            errorMessage = 'Sign in already in progress';
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            errorMessage = 'Google Play Services not available';
        }

        return { success: false, error: errorMessage };
    }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error('Google Sign-Out Error:', error);
    }
};

export default {
    configureGoogleSignIn,
    signInWithGoogle,
    signOutFromGoogle,
};
