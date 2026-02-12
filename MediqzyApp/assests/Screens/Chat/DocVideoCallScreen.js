import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import livekitService from '../../Utils/livekitService';
import auth from '@react-native-firebase/auth';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width, height } = Dimensions.get('window');

// Demo Mode Video Call Content - Simulates video call UI
function DemoVideoCallContent({ doctor, navigation, isMuted, setIsMuted, isVideoOn, setIsVideoOn, isConnected, setIsConnected }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulsing animation for waiting state
    if (!isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isConnected]);

  // Simulate doctor joining after 5 seconds in demo mode
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleEndCall = () => {
    livekitService.clearSession();
    navigation.goBack();
  };

  const handleChat = () => {
    navigation.navigate('DoctorChatScreen', { doctor });
  };

  if (!isConnected) {
    // Waiting/Ringing State
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Video Consultation</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>TEST MODE</Text>
          </View>
        </View>

        <LinearGradient
          colors={['#E8F4FD', '#B8D4E8', '#A0C4D8']}
          style={styles.ringingContainer}
        >
          <View style={styles.ringingContent}>
            <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Image source={require('../../images/IndianDoctor.png')} style={styles.ringingAvatar} />
            </Animated.View>
            <Text style={styles.ringingName}>{doctor.name}</Text>
            <Text style={styles.ringingSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.ringingStatus}>Connecting...</Text>

            <View style={styles.connectingDots}>
              <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
              <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            </View>
          </View>

          <View style={styles.callControls}>
            <TouchableOpacity
              style={[styles.controlBtn, styles.micBtn]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, isVideoOn ? styles.videoBtn : styles.videoOffBtn]}
              onPress={() => setIsVideoOn(!isVideoOn)}
            >
              <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={handleEndCall}>
              <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Connected State - Simulated Video Call
  return (
    <View style={styles.container}>
      <View style={styles.videoHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>Video Consultation</Text>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>TEST MODE</Text>
        </View>
      </View>

      {/* Simulated Remote Video - Doctor's feed */}
      <View style={styles.videoContainer}>
        <Image
          source={require('../../images/IndianDoctor.png')}
          style={styles.simulatedVideo}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.videoGradient}
        />

        {/* Doctor Info Overlay */}
        <View style={styles.doctorOverlay}>
          <Text style={styles.doctorOverlayName}>{doctor.name}</Text>
          <Text style={styles.doctorOverlaySpecialty}>{doctor.specialty}</Text>
          <View style={styles.callDuration}>
            <View style={styles.liveDot} />
            <Text style={styles.callDurationText}>Connected</Text>
          </View>
        </View>

        {/* Local Preview - Self view */}
        {isVideoOn && (
          <View style={styles.localPreviewContainer}>
            <LinearGradient
              colors={['#23238E', '#3B4FBF']}
              style={styles.localPreview}
            >
              <Ionicons name="person" size={40} color="#fff" />
              <Text style={styles.localPreviewText}>You</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.videoCallControls}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted ? styles.mutedBtn : styles.micBtn]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#fff" : "#222"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isVideoOn ? styles.videoBtn : styles.videoOffBtn]}
          onPress={() => setIsVideoOn(!isVideoOn)}
        >
          <Ionicons name={isVideoOn ? "videocam" : "videocam-off"} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
          <Ionicons name="chatbubble" size={24} color="#23238E" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={handleEndCall}>
          <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DocVideoCallScreen({ navigation, route }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const doctor = route?.params?.doctor || {
    name: 'Dr. Suresh Tanmani',
    specialty: 'ENT Specialist',
    id: 'default_doctor_id',
  };

  const appointmentId = route?.params?.appointmentId || `appt_${Date.now()}`;

  useEffect(() => {
    const initializeVideoCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if running in demo mode
        if (livekitService.isDemoMode()) {
          console.log('[VideoCall] Running in TEST MODE');
          setIsDemoMode(true);

          // Simulate initialization
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsLoading(false);
          return;
        }

        // Production mode - needs authentication
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('Please log in to start a video call');
        }

        const roomName = livekitService.generateRoomName(doctor.id, appointmentId);
        const participantName = currentUser.displayName || currentUser.email || 'Patient';

        const tokenResponse = await livekitService.getAccessToken(
          roomName,
          participantName,
          'patient'
        );

        if (tokenResponse) {
          console.log('[VideoCall] Connected to room:', roomName);
        } else {
          throw new Error('Failed to get video call token');
        }

      } catch (err) {
        console.error('[VideoCall] Initialization error:', err);
        setError(err.message || 'Failed to initialize video call');

        Alert.alert(
          'Video Call Error',
          err.message || 'Failed to start video call. Please try again.',
          [
            { text: 'Go Back', onPress: () => navigation.goBack() },
            { text: 'Retry', onPress: () => initializeVideoCall() },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeVideoCall();

    return () => {
      livekitService.clearSession();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.loadingAnimation}>
          <Ionicons name="videocam" size={48} color="#23238E" />
        </View>
        <Text style={styles.loadingText}>Starting Video Consultation...</Text>
        <Text style={styles.loadingSubtext}>Please wait while we connect you</Text>
      </View>
    );
  }

  if (error && !isDemoMode) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="videocam-off" size={64} color="#E53935" />
        <Text style={styles.errorTitle}>Unable to Connect</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Demo/Test Mode UI
  return (
    <DemoVideoCallContent
      doctor={doctor}
      navigation={navigation}
      isMuted={isMuted}
      setIsMuted={setIsMuted}
      isVideoOn={isVideoOn}
      setIsVideoOn={setIsVideoOn}
      isConnected={isConnected}
      setIsConnected={setIsConnected}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    backgroundColor: '#fff',
    zIndex: 10,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#222',
    marginLeft: scale(12)
  },
  demoBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(4),
  },
  demoBadgeText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  ringingContainer: {
    flex: 1,
  },
  ringingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ringingAvatar: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
  },
  ringingName: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp(0.5),
  },
  ringingSpecialty: {
    fontSize: moderateScale(16),
    color: '#555',
    marginBottom: hp(2),
  },
  ringingStatus: {
    fontSize: moderateScale(16),
    color: '#23238E',
    fontWeight: '500',
  },
  connectingDots: {
    flexDirection: 'row',
    marginTop: hp(2),
    gap: scale(8),
  },
  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: '#23238E',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(8),
    gap: scale(24),
  },
  controlBtn: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  micBtn: {
    backgroundColor: '#fff',
  },
  mutedBtn: {
    backgroundColor: '#E53935',
  },
  videoBtn: {
    backgroundColor: '#23238E',
  },
  videoOffBtn: {
    backgroundColor: '#555',
  },
  endCallBtn: {
    backgroundColor: '#E53935',
  },
  chatBtn: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
  },
  videoContainer: {
    flex: 1,
  },
  simulatedVideo: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(30),
  },
  doctorOverlay: {
    position: 'absolute',
    bottom: hp(15),
    left: wp(4),
  },
  doctorOverlayName: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  doctorOverlaySpecialty: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.9)',
    marginTop: hp(0.5),
  },
  callDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
  },
  liveDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#4CAF50',
    marginRight: scale(6),
  },
  callDurationText: {
    fontSize: moderateScale(12),
    color: '#4CAF50',
    fontWeight: '600',
  },
  localPreviewContainer: {
    position: 'absolute',
    top: hp(12),
    right: wp(4),
    width: scale(100),
    height: scale(140),
    borderRadius: scale(12),
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  localPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localPreviewText: {
    color: '#fff',
    fontSize: moderateScale(12),
    marginTop: hp(1),
  },
  videoCallControls: {
    position: 'absolute',
    bottom: hp(5),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(16),
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#23238E',
  },
  loadingSubtext: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#222',
  },
  errorText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: wp(8),
  },
  retryButton: {
    marginTop: verticalScale(24),
    backgroundColor: '#23238E',
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: scale(8),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
