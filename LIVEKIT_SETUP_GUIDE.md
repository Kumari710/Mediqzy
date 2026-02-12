# 🎥 LiveKit Video Call Setup Guide for MediqzyApp

This guide will help you complete the LiveKit video call integration with Firebase Cloud Functions.

## 📋 Prerequisites

1. **Firebase Project** - You should already have this set up
2. **Firebase Blaze Plan** - Required for Cloud Functions
3. **LiveKit Cloud Account** - Free tier available at https://cloud.livekit.io/

---

## 🚀 Step 1: Create a LiveKit Cloud Account

1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Sign up for a free account
3. Create a new project (e.g., "MediqzyApp")
4. After project creation, you'll receive:
   - **WebSocket URL**: `wss://your-app-name.livekit.cloud`
   - **API Key**: A string like `APIxxxxxx`
   - **API Secret**: A long secret string

⚠️ **Keep your API Secret safe!** Never expose it in your mobile app.

---

## 🔥 Step 2: Set Up Firebase Cloud Functions

### 2.1 Install Firebase CLI (if not installed)

```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase

```bash
firebase login
```

### 2.3 Initialize Firebase Functions

Navigate to the project root and run:

```bash
cd c:\Mediqzt-App
firebase init functions
```

When prompted:
- Select your existing Firebase project
- Choose **JavaScript** as the language
- Say **Yes** to ESLint
- Say **Yes** to install dependencies

This will create a `functions` folder. **However**, we've already created a `firebase-functions` folder with the necessary code. You can either:

**Option A**: Copy our files to the `functions` folder Firebase created:
```bash
copy firebase-functions\* functions\
```

**Option B**: Rename our folder to `functions`:
```bash
rename firebase-functions functions
```

### 2.4 Install Dependencies

```bash
cd functions
npm install
```

### 2.5 Set LiveKit Environment Variables

Create a `.env` file in the `functions` folder:

```bash
# functions/.env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_WS_URL=wss://your-app-name.livekit.cloud
```

Replace with your actual LiveKit credentials from Step 1.

---

## 📤 Step 3: Deploy Cloud Functions

```bash
cd c:\Mediqzt-App\functions
firebase deploy --only functions
```

After deployment, you'll see output like:
```
✔ functions[getLivekitToken]: Successful
✔ functions[createVideoCallRoom]: Successful
```

---

## 📱 Step 4: Update React Native App Configuration

Update `apiConfig.js` with your LiveKit WebSocket URL:

```javascript
// c:\Mediqzt-App\MediqzyApp\assests\Utils\apiConfig.js

export const LIVEKIT_CONFIG = {
    WS_URL: 'wss://your-app-name.livekit.cloud', // Your actual LiveKit URL
};
```

---

## 🧪 Step 5: Test the Integration

### 5.1 Run the App

```bash
cd c:\Mediqzt-App\MediqzyApp
npx react-native run-android
```

### 5.2 Test Video Call

1. Log in to the app
2. Navigate to a doctor consultation
3. Tap "Video Call" button
4. Grant camera and microphone permissions
5. The app should connect to LiveKit

### 5.3 Test with Two Devices

To test an actual video call:
1. Open the app on two devices (or one device + emulator)
2. Join the same room from both devices
3. You should see each other's video feeds

---

## 🔧 Troubleshooting

### "User must be logged in" Error
- Make sure you're logged in with Firebase Auth before starting a video call

### "Network Error"
- Check your internet connection
- Verify Firebase functions are deployed correctly
- Check Firebase Console for function logs

### "Failed to generate token"
- Verify LiveKit credentials in `.env` file
- Check Firebase Functions logs: `firebase functions:log`

### Camera/Microphone Not Working
- Ensure permissions are granted in Android settings
- Check that `AndroidManifest.xml` has camera and microphone permissions

---

## 📁 File Structure

```
c:\Mediqzt-App\
├── MediqzyApp/
│   └── assests/
│       ├── Utils/
│       │   ├── apiConfig.js          # LiveKit URL config
│       │   └── livekitService.js     # LiveKit service (calls Firebase)
│       └── Screens/
│           └── Chat/
│               └── DocVideoCallScreen.js  # Video call UI
│
└── firebase-functions/ (or functions/)
    ├── index.js           # Cloud Functions (token generation)
    ├── package.json       # Dependencies
    └── .env               # LiveKit credentials (create this)
```

---

## 🎯 What's Included

### Firebase Cloud Functions (`index.js`)

1. **`getLivekitToken`** - Generates a token for a single user to join a room
2. **`createVideoCallRoom`** - Creates a room with tokens for both doctor and patient

### React Native Service (`livekitService.js`)

- Calls Firebase Cloud Functions securely
- Handles authentication
- Manages room connections

### Video Call Screen (`DocVideoCallScreen.js`)

- Full video call UI with LiveKit components
- Local and remote video display
- Mute/unmute, camera toggle, end call controls
- Loading and error states

---

## 🆓 LiveKit Cloud Free Tier

LiveKit Cloud includes a generous free tier:
- **50 participant hours/month** free
- Perfect for development and small-scale use

---

## 📞 Need Help?

- **LiveKit Documentation**: https://docs.livekit.io/
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **LiveKit Discord**: https://livekit.io/discord

---

## ✅ Checklist

- [ ] Created LiveKit Cloud account
- [ ] Got API Key, Secret, and WebSocket URL
- [ ] Installed Firebase CLI
- [ ] Created `.env` file with LiveKit credentials
- [ ] Deployed Firebase Cloud Functions
- [ ] Updated `apiConfig.js` with LiveKit WebSocket URL
- [ ] Tested video call in the app

---

Happy coding! 🎉
