/**
 * Firebase Cloud Functions for MediqzyApp
 * 
 * This file contains the Cloud Function to generate LiveKit access tokens
 * for video consultations between doctors and patients.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { AccessToken } = require("livekit-server-sdk");

// Initialize Firebase Admin
initializeApp();

/**
 * LiveKit Configuration
 * 
 * IMPORTANT: Replace these with your actual LiveKit Cloud credentials
 * Get these from https://cloud.livekit.io/
 * 
 * For security, use Firebase environment configuration:
 * firebase functions:config:set livekit.api_key="YOUR_API_KEY" livekit.api_secret="YOUR_API_SECRET" livekit.ws_url="wss://your-app.livekit.cloud"
 */
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "YOUR_LIVEKIT_API_KEY";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "YOUR_LIVEKIT_API_SECRET";
const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || "wss://your-app.livekit.cloud";

/**
 * Generate LiveKit Access Token
 * 
 * This function generates a JWT token that allows a user to join a LiveKit room.
 * It validates the user's Firebase authentication before generating the token.
 * 
 * @param {Object} data - The request data
 * @param {string} data.roomName - The name of the room to join
 * @param {string} data.participantName - The display name of the participant
 * @param {string} data.participantType - Either 'doctor' or 'patient'
 */
exports.getLivekitToken = onCall({
    cors: true,
    maxInstances: 10,
}, async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "User must be authenticated to join a video call."
        );
    }

    const { roomName, participantName, participantType } = request.data;

    // Validate required fields
    if (!roomName || !participantName) {
        throw new HttpsError(
            "invalid-argument",
            "Room name and participant name are required."
        );
    }

    // Validate participant type
    const validTypes = ["doctor", "patient"];
    if (participantType && !validTypes.includes(participantType)) {
        throw new HttpsError(
            "invalid-argument",
            "Participant type must be 'doctor' or 'patient'."
        );
    }

    try {
        // Get the authenticated user's info
        const uid = request.auth.uid;
        const userRecord = await getAuth().getUser(uid);

        // Create a unique participant identity
        const identity = `${participantType || "user"}_${uid}`;

        // Generate the LiveKit access token
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: identity,
            name: participantName || userRecord.displayName || "Anonymous",
            // Token expires in 1 hour
            ttl: "1h",
        });

        // Grant permissions for the room
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        // Generate the JWT token
        const token = await at.toJwt();

        console.log(`[LiveKit] Token generated for ${identity} in room ${roomName}`);

        return {
            token: token,
            serverUrl: LIVEKIT_WS_URL,
            roomName: roomName,
            identity: identity,
        };

    } catch (error) {
        console.error("[LiveKit] Error generating token:", error);
        throw new HttpsError(
            "internal",
            "Failed to generate video call token. Please try again."
        );
    }
});

/**
 * Create a Video Call Room
 * 
 * This function creates a room and returns tokens for both doctor and patient.
 * Used when initiating a new video consultation.
 * 
 * @param {Object} data - The request data
 * @param {string} data.doctorId - Firebase UID of the doctor
 * @param {string} data.patientId - Firebase UID of the patient
 * @param {string} data.appointmentId - The appointment ID for reference
 */
exports.createVideoCallRoom = onCall({
    cors: true,
    maxInstances: 10,
}, async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "User must be authenticated to create a video call."
        );
    }

    const { doctorId, patientId, appointmentId } = request.data;

    if (!doctorId || !patientId) {
        throw new HttpsError(
            "invalid-argument",
            "Doctor ID and Patient ID are required."
        );
    }

    try {
        // Create a unique room name based on appointment
        const roomName = `consultation_${appointmentId || Date.now()}`;

        // Get user details
        const [doctorRecord, patientRecord] = await Promise.all([
            getAuth().getUser(doctorId),
            getAuth().getUser(patientId),
        ]);

        // Generate token for doctor
        const doctorToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `doctor_${doctorId}`,
            name: doctorRecord.displayName || "Doctor",
            ttl: "2h",
        });
        doctorToken.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        // Generate token for patient
        const patientToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `patient_${patientId}`,
            name: patientRecord.displayName || "Patient",
            ttl: "2h",
        });
        patientToken.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        console.log(`[LiveKit] Created room ${roomName} for appointment ${appointmentId}`);

        return {
            roomName: roomName,
            serverUrl: LIVEKIT_WS_URL,
            doctorToken: await doctorToken.toJwt(),
            patientToken: await patientToken.toJwt(),
        };

    } catch (error) {
        console.error("[LiveKit] Error creating room:", error);
        throw new HttpsError(
            "internal",
            "Failed to create video call room. Please try again."
        );
    }
});
