/**
 * WebRTC Video Calling Service
 * 
 * Handles peer-to-peer video calls using Socket.IO for signaling.
 */

import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from 'react-native-webrtc';
import io from 'socket.io-client';
import { WEBRTC_CONFIG } from './apiConfig';

class VideoCallService {
    constructor() {
        this.socket = null;
        this.peerConnection = null;
        this.localStream = null;
    }

    /**
     * Initialize signaling connection
     */
    init(userId) {
        if (!this.socket) {
            this.socket = io(WEBRTC_CONFIG.SIGNALING_SERVER, {
                query: { userId },
                transports: ['websocket'],
            });

            this.setupSocketListeners();
        }
    }

    setupSocketListeners() {
        this.socket.on('offer', async (data) => {
            await this.handleOffer(data);
        });

        this.socket.on('answer', async (data) => {
            await this.handleAnswer(data);
        });

        this.socket.on('ice-candidate', async (data) => {
            await this.handleIceCandidate(data);
        });
    }

    /**
     * Start local media stream
     */
    async getLocalStream() {
        try {
            const isFront = true;
            const sourceInfos = await mediaDevices.enumerateDevices();
            let videoSourceId;

            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (sourceInfo.kind === 'videoinput' && sourceInfo.facing === (isFront ? 'front' : 'environment')) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }

            const stream = await mediaDevices.getUserMedia({
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 640,
                        minHeight: 480,
                        minFrameRate: 30,
                    },
                    facingMode: (isFront ? 'user' : 'environment'),
                    optional: (videoSourceId ? [{ sourceId: videoSourceId }] : []),
                },
            });

            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error getting local stream:', error);
            throw error;
        }
    }

    /**
     * Create Peer Connection
     */
    createPeerConnection(targetUserId) {
        this.peerConnection = new RTCPeerConnection({
            iceServers: WEBRTC_CONFIG.ICE_SERVERS,
        });

        // Add local stream tracks to peer connection
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            if (this.onRemoteStream) {
                this.onRemoteStream(event.streams[0]);
            }
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    to: targetUserId,
                    candidate: event.candidate,
                });
            }
        };
    }

    /**
     * Start a call
     */
    async startCall(targetUserId) {
        this.createPeerConnection(targetUserId);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit('offer', {
            to: targetUserId,
            offer: offer,
        });
    }

    /**
     * Handle incoming offer
     */
    async handleOffer({ from, offer }) {
        this.createPeerConnection(from);

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.socket.emit('answer', {
            to: from,
            answer: answer,
        });
    }

    /**
     * Handle incoming answer
     */
    async handleAnswer({ answer }) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    /**
     * Handle ICE candidate from peer
     */
    async handleIceCandidate({ candidate }) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    /**
     * End call
     */
    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
    }
}

export const videoCallService = new VideoCallService();
export default videoCallService;
