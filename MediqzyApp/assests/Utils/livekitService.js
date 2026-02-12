/**
 * LiveKit Video Calling Service
 * 
 * Manages room connections and media tracks using LiveKit SDK.
 * 
 * TEST MODE: Currently running in test mode for UI demonstration.
 * When you have LiveKit credentials, set DEMO_MODE to false and
 * update LIVEKIT_CONFIG in apiConfig.js
 */

import { LIVEKIT_CONFIG } from './apiConfig';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/app';

// ============================================
// TEST MODE CONFIGURATION
// Set to false when you have LiveKit credentials
// ============================================
const DEMO_MODE = true;

class LivekitService {
    constructor() {
        this.currentRoom = null;
        this.currentToken = null;
        this.demoMode = DEMO_MODE;
    }

    /**
     * Check if LiveKit is properly configured
     */
    isConfigured() {
        const wsUrl = LIVEKIT_CONFIG?.WS_URL || '';
        return wsUrl &&
            !wsUrl.includes('YOUR_LIVEKIT_APP') &&
            !wsUrl.includes('your-app') &&
            wsUrl.startsWith('wss://');
    }

    /**
     * Check if running in demo mode
     */
    isDemoMode() {
        return this.demoMode || !this.isConfigured();
    }

    /**
     * Get access token - returns demo token in test mode
     * 
     * @param {string} roomName - Name of the room to join
     * @param {string} participantName - Display name for the participant
     * @param {string} participantType - 'doctor' or 'patient'
     * @returns {Promise<Object>} Token response
     */
    async getAccessToken(roomName, participantName, participantType = 'patient') {
        // TEST MODE - Return simulated token for UI testing
        if (this.isDemoMode()) {
            console.log('[LiveKit] Running in TEST MODE - Simulated video call');

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const demoToken = `demo_token_${Date.now()}`;
            this.currentToken = demoToken;
            this.currentRoom = roomName;

            return {
                token: demoToken,
                serverUrl: 'wss://demo.livekit.cloud',
                roomName: roomName,
                identity: `${participantType}_demo_${Date.now()}`,
                isDemo: true,
            };
        }

        // PRODUCTION MODE - Use Firebase Cloud Function
        try {
            const currentUser = auth().currentUser;

            if (!currentUser) {
                console.error('[LiveKit] User not authenticated');
                throw new Error('User must be logged in to start a video call');
            }

            console.log(`[LiveKit] Requesting token for Room: ${roomName}, User: ${participantName}`);

            // Call Firebase Cloud Function
            const getLivekitToken = firebase.functions().httpsCallable('getLivekitToken');

            const result = await getLivekitToken({
                roomName: roomName,
                participantName: participantName,
                participantType: participantType,
            });

            if (result.data && result.data.token) {
                this.currentToken = result.data.token;
                this.currentRoom = roomName;

                console.log(`[LiveKit] Token received successfully for room: ${roomName}`);

                return {
                    token: result.data.token,
                    serverUrl: result.data.serverUrl || LIVEKIT_CONFIG.WS_URL,
                    roomName: result.data.roomName,
                    identity: result.data.identity,
                };
            } else {
                throw new Error('Invalid token response from server');
            }

        } catch (error) {
            console.error('[LiveKit] Token fetch error:', error);

            if (error.code === 'functions/unauthenticated') {
                throw new Error('Please log in to start a video call');
            } else if (error.code === 'functions/invalid-argument') {
                throw new Error('Invalid call parameters');
            } else if (error.message?.includes('network')) {
                throw new Error('Network error. Please check your connection');
            }

            throw error;
        }
    }

    /**
     * Create a video call room for doctor-patient consultation
     */
    async createVideoCallRoom(doctorId, patientId, appointmentId) {
        if (this.isDemoMode()) {
            console.log('[LiveKit] TEST MODE - Creating demo room');
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                roomName: `demo_consultation_${appointmentId || Date.now()}`,
                serverUrl: 'wss://demo.livekit.cloud',
                doctorToken: `demo_doctor_token_${Date.now()}`,
                patientToken: `demo_patient_token_${Date.now()}`,
                isDemo: true,
            };
        }

        try {
            const currentUser = auth().currentUser;

            if (!currentUser) {
                throw new Error('User must be logged in');
            }

            console.log(`[LiveKit] Creating room for appointment: ${appointmentId}`);

            const createRoom = firebase.functions().httpsCallable('createVideoCallRoom');

            const result = await createRoom({
                doctorId: doctorId,
                patientId: patientId,
                appointmentId: appointmentId,
            });

            if (result.data) {
                console.log(`[LiveKit] Room created: ${result.data.roomName}`);
                return result.data;
            } else {
                throw new Error('Failed to create video call room');
            }

        } catch (error) {
            console.error('[LiveKit] Create room error:', error);
            throw error;
        }
    }

    /**
     * Get the LiveKit Server URL from config
     */
    getServerUrl() {
        if (this.isDemoMode()) {
            return 'wss://demo.livekit.cloud';
        }
        return LIVEKIT_CONFIG.WS_URL;
    }

    /**
     * Get current room name
     */
    getCurrentRoom() {
        return this.currentRoom;
    }

    /**
     * Clear current session
     */
    clearSession() {
        this.currentRoom = null;
        this.currentToken = null;
    }

    /**
     * Generate a room name for a doctor appointment
     */
    generateRoomName(doctorId, appointmentId) {
        const timestamp = Date.now();
        return `consultation_${doctorId}_${appointmentId || timestamp}`;
    }
}

export const livekitService = new LivekitService();
export default livekitService;
