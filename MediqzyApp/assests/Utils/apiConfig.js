/**
 * API Configuration and Environment Variables
 * 
 * Replace placeholders with actual credentials from your consoles:
 * - Google Cloud Console (OAuth, Maps, Fit, YouTube)
 * - Google AI Studio (Gemini)
 * - Firebase Console (FCM)
 */

export const GOOGLE_CONFIG = {
    WEB_CLIENT_ID: '982376166047-j975co5qc5enqhcesggbsee3obnj7tqa.apps.googleusercontent.com', // Replace with VITE_GOOGLE_CLIENT_ID
    MAPS_API_KEY: 'AIzaSyDaZ01o4UhYs59mZahFiL6pyR74JNSBpTQ',                           // Replace with GOOGLE_MAPS_API_KEY
    YOUTUBE_API_KEY: 'AIzaSyDaZ01o4UhYs59mZahFiL6pyR74JNSBpTQ',                     // Replace with VITE_YOUTUBE_API_KEY
};

export const GEMINI_CONFIG = {
    API_KEY: 'AIzaSyBrqazbdByq_lg5MeLN91YpfE5wVbs8gJg',                                     // Replace with VITE_GEMINI_API_KEY or GEMINI_API_KEY
};

export const FIREBASE_CONFIG = {
    VAPID_KEY: 'BMR-v0zDJTYcXyF-69jwyk4BPzcPGOArW5VK8WxBLiB99Ult0I7gNkcJiFLTmRTUc8VdbcpwYlL7EMOpG9hCsk4',                                   // Replace with VITE_FIREBASE_VAPID_KEY
};

export const EMAILJS_CONFIG = {
    SERVICE_ID: 'YOUR_SERVICE_ID', // Get from emailjs.com
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID', // Create template with {{otp_code}} and {{user_email}}
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',
};

export const WEBRTC_CONFIG = {
    SIGNALING_SERVER: 'https://192.168.1.72',                         // Replace with VITE_SOCKET_URL
    ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here for production
    ],
};

/**
 * LiveKit Configuration
 * 
 * Get your credentials from https://cloud.livekit.io/
 * 1. Create a new project
 * 2. Copy the WebSocket URL (looks like wss://your-app.livekit.cloud)
 * 3. The API Key and Secret are stored in Firebase Cloud Functions
 */
export const LIVEKIT_CONFIG = {
    // Replace with your LiveKit Cloud WebSocket URL
    // Example: 'wss://mediqzy-app-abc123.livekit.cloud'
    WS_URL: 'wss://YOUR_LIVEKIT_APP.livekit.cloud',

    // Token is generated via Firebase Cloud Functions (no URL needed here)
    // The function name is 'getLivekitToken'
};

export default {
    GOOGLE_CONFIG,
    GEMINI_CONFIG,
    FIREBASE_CONFIG,
    WEBRTC_CONFIG,
    EMAILJS_CONFIG,
    LIVEKIT_CONFIG,
};
