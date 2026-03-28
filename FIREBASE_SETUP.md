# Firebase Setup for MediqzyApp

This document outlines the steps taken to integrate Firebase services into the MediqzyApp application.

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `MediqzyApp`
4. Enable/disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Add Android App to Firebase
1. In Firebase Console, click the **Android icon** to add an Android app
2. Enter Android package name: `com.mediqzyapp`
3. (Optional) Enter app nickname: `MediqzyApp App`
4. Click **Register app**
5. Download the `google-services.json` file
6. **Place the file at**: `MediqzyApp/android/app/google-services.json`

### Step 3: Enable Firebase Services
In Firebase Console, enable the following services:

#### Authentication
1. Go to **Build > Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. (Optional) Enable **Phone** sign-in for OTP

#### Firestore Database
1. Go to **Build > Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location
5. Click **Enable**

### Step 4: Install Firebase Packages
Run this command in your terminal:

```bash
cd c:\Mediqzt-App\MediqzyApp
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### Step 5: Rebuild the App
```bash
# Stop any running Metro bundler, then:
npx react-native run-android
```

---

## 📁 Files Created

| File | Description |
|------|-------------|
| `Utils/firebaseConfig.js` | Firebase initialization |
| `Utils/firebaseAuth.js` | Authentication service (signup, signin, OTP) |
| `Utils/firebaseActivityStorage.js` | Cloud storage for activity data |

---

## 📋 Gradle Files Updated

### `android/build.gradle`
Added Google Services classpath:
```gradle
classpath("com.google.gms:google-services:4.4.2")
```

### `android/app/build.gradle`
Added plugin at bottom:
```gradle
apply plugin: "com.google.gms.google-services"
```

---

## 🔧 How to Use Firebase in Your Screens

### Using Firebase Auth (Login/SignUp)

```javascript
import { signIn, signUp, signOut } from '../Utils/firebaseAuth';

// Sign Up
const result = await signUp(email, password);
if (result.success) {
    console.log('User created:', result.user);
    navigation.navigate('Success');
} else {
    setError(result.error);
}

// Sign In
const result = await signIn(email, password, rememberMe);
if (result.success) {
    navigation.replace('Home');
} else {
    setError(result.error);
}

// Sign Out
await signOut();
```

### Using Firebase Activity Storage

```javascript
import { 
    getDailyActivity, 
    saveDailyActivity,
    subscribeToActivityUpdates 
} from '../Utils/firebaseActivityStorage';

// Get today's data
const data = await getDailyActivity();

// Save activity
await saveDailyActivity({ steps: 5000, calories: 200 });

// Real-time updates
const unsubscribe = subscribeToActivityUpdates(getTodayDate(), (data) => {
    console.log('Data updated:', data);
});
```

---

## 🔄 Migration from AsyncStorage

To migrate existing user data to Firebase:

```javascript
import { migrateLocalDataToFirebase } from '../Utils/firebaseActivityStorage';

// Call after user logs in
useEffect(() => {
    if (isLoggedIn) {
        migrateLocalDataToFirebase();
    }
}, []);
```

---

## 🔐 Firestore Security Rules (For Production)

Replace test rules with these in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /activityData/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /activityGoals/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ⚠️ Common Issues & Solutions

### Error: "No Firebase App '...' has been created"
**Solution**: Make sure `google-services.json` is in `android/app/`

### Error: "google-services.json not found"
**Solution**: Download from Firebase Console and place in correct location

### Build fails after adding Firebase
**Solution**: Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### App crashes on startup
**Solution**: Ensure all plugins are applied correctly in gradle files

---

## 📱 Testing the Setup

1. Run the app: `npx react-native run-android`
2. Try to sign up with a new email
3. Check Firebase Console > Authentication to see the new user
4. Add some activity data
5. Check Firebase Console > Firestore to see the data

---

## 🎉 What's Next?

After setup is complete, you can:
1. Update LoginScreen.js to use Firebase Auth
2. Update SignUpScreen.js to use Firebase Auth
3. Switch activity storage from AsyncStorage to Firestore
4. Add social login (Google, Facebook, Apple)
5. Add push notifications with Firebase Cloud Messaging

---

## Need Help?

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
