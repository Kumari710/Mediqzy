import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function CallScreen({ navigation, route }) {
    const doctor = route?.params?.doctor || {
        name: 'Dr. Suresh Tanmani',
        specialty: 'ENT Specialist',
    };

    const [seconds, setSeconds] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <LinearGradient colors={['#23238E', '#1E1E7A']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#23238E" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-down" size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.secureRow}>
                            <Ionicons name="lock-closed" size={12} color="#4CAF50" />
                            <Text style={styles.secureText}>End-to-end encrypted</Text>
                        </View>
                        <View style={{ width: scale(28) }} />
                    </View>

                    {/* Doctor Info */}
                    <View style={styles.doctorInfo}>
                        <View style={styles.avatarContainer}>
                            <Image source={require('../../images/IndianDoctor.png')} style={styles.avatar} />
                            <View style={styles.pulseContainer}>
                                <View style={styles.pulse} />
                            </View>
                        </View>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.duration}>{formatTime(seconds)}</Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                                onPress={() => setIsMuted(!isMuted)}
                            >
                                <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#fff" : "#fff"} />
                                <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
                                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                            >
                                <Ionicons name={isSpeakerOn ? "volume-high" : "volume-medium"} size={24} color="#fff" />
                                <Text style={styles.controlLabel}>Speaker</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.controlBtn} onPress={() => navigation.navigate('DoctorChatScreen')}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
                                <Text style={styles.controlLabel}>Message</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.endCallBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="call" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    content: { flex: 1, paddingHorizontal: wp(5) },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: hp(2),
    },
    secureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    secureText: {
        color: '#4CAF50',
        fontSize: moderateScale(10),
        fontWeight: '500',
    },
    doctorInfo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: hp(2.5),
    },
    avatar: {
        width: scale(140),
        height: scale(140),
        borderRadius: scale(70),
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    pulseContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    pulse: {
        width: scale(160),
        height: scale(160),
        borderRadius: scale(80),
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    doctorName: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: hp(0.5),
    },
    doctorSpecialty: {
        fontSize: moderateScale(16),
        color: 'rgba(255,255,255,0.7)',
        marginBottom: hp(2.5),
    },
    duration: {
        fontSize: moderateScale(18),
        color: '#fff',
        fontWeight: '500',
        fontFamily: 'monospace',
    },
    controls: {
        marginBottom: hp(5),
        alignItems: 'center',
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: wp(5),
        marginBottom: hp(5),
    },
    controlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: scale(70),
    },
    controlBtnActive: {
        opacity: 0.5,
    },
    controlLabel: {
        color: '#fff',
        fontSize: moderateScale(12),
        marginTop: hp(1),
    },
    endCallBtn: {
        width: scale(72),
        height: scale(72),
        borderRadius: scale(36),
        backgroundColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '135deg' }],
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
});
