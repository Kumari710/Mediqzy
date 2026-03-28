/**
 * Firebase Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Add an Android app with package name: com.mediqzyapp
 * 3. Download google-services.json and place in android/app/
 * 4. Run: npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
 * 5. Update android/build.gradle and android/app/build.gradle as instructed
 * 
 * This file initializes Firebase and exports app instance
 */

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase is auto-initialized from google-services.json (Android) 
// and GoogleService-Info.plist (iOS)

// Check if Firebase is initialized
const isFirebaseInitialized = () => {
    try {
        return firebase.apps.length > 0;
    } catch (error) {
        return false;
    }
};

// Export Firebase services
export { firebase, auth, firestore, isFirebaseInitialized };

// Default export
export default firebase;
