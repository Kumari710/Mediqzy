import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    FlatList,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#23238E',
    emergency: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#F8FAFC',
    white: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    aiPurple: '#8B5CF6',
};

const EmergencyServicesScreen = ({ navigation }) => {
    const [region, setRegion] = useState({
        latitude: 16.0819,
        longitude: 80.1697,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const emergencyNumbers = [
        { id: '1', title: 'Ambulance', subtitle: 'Medical Emergency', number: '102', icon: 'medical' },
        { id: '2', title: 'Police', subtitle: 'Law Enforcement', number: '100', icon: 'shield-checkmark' },
        { id: '3', title: 'Fire', subtitle: 'Fire Emergency', number: '101', icon: 'flame' },
    ];

    const onlineDoctors = [
        { id: '1', name: 'Dr Priya Patel', specialty: 'General Practitioner', rating: '4.5', fee: '₹500.00', image: 'https://img.freepik.com/free-photo/pleased-young-female-doctor-white-coat-with-stethoscope-around-neck-standing-with-folded-arms_409827-254.jpg' },
        { id: '2', name: 'Dr Nandita Agarwal', specialty: 'General Physician', rating: '4.5', fee: '₹1.00', image: 'https://img.freepik.com/free-photo/healthcare-workers-medicine-insurance-healthcare-concept-friendly-smiling-asian-female-doctor-white-coat-glasses-reaching-out-hand-greeting-patient_1258-76343.jpg' },
    ];

    const nearbyHospitals = [
        { id: '1', name: 'Rathna Lakshmi Nursing Home', type: 'Clinic', distance: '0.5 km away', area: 'Chilakaluripet', lat: 16.085, lng: 80.165 },
        { id: '2', name: 'Dr. Ramesh Hospital', type: 'Hospital', distance: '0.5 km away', area: 'Chilakaluripet', status: '24/7', lat: 16.080, lng: 80.175, phone: '086472 57898' },
        { id: '3', name: 'Vijaya Nursing Home', type: 'Hospital', distance: '0.6 km away', area: 'Chilakaluripet', status: '24/7', lat: 16.075, lng: 80.160, phone: '086472 57898' },
    ];

    const handleCall = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const handleSOS = () => {
        // Logic for SOS alert
        alert('SOS Triggered! Dispatching location to emergency contacts.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Services</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Intro */}
                <Text style={styles.introText}>
                    Get instant AI triage, trigger SOS alerts, and navigate to the nearest 24/7 emergency facilities.
                </Text>

                {/* AI Triage Section */}
                <LinearGradient
                    colors={['#F5F3FF', '#EDE9FE']}
                    style={styles.sectionCard}
                >
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconBg, { backgroundColor: COLORS.aiPurple }]}>
                            <Ionicons name="sparkles" size={20} color={COLORS.white} />
                        </View>
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionLabel}>AI</Text>
                            <Text style={styles.sectionTitle}>Dr. iSHA Emergency Triage</Text>
                            <Text style={styles.sectionSubtitle}>AI-powered multi-modal emergency assessment</Text>
                        </View>
                    </View>

                    <View style={styles.aiActions}>
                        <TouchableOpacity style={styles.aiActionButton} onPress={() => navigation.navigate('AIAssistantScreen', { mode: 'emergency', type: 'chat' })}>
                            <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.aiPurple} />
                            <Text style={styles.aiActionText}>Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.aiActionButton} onPress={() => navigation.navigate('AIAssistantScreen', { mode: 'emergency', type: 'voice' })}>
                            <Ionicons name="mic" size={24} color={COLORS.aiPurple} />
                            <Text style={styles.aiActionText}>Voice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.aiActionButton} onPress={() => navigation.navigate('AIAssistantScreen', { mode: 'emergency', type: 'video' })}>
                            <Ionicons name="videocam" size={24} color={COLORS.aiPurple} />
                            <Text style={styles.aiActionText}>Video</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.primaryActionButton} onPress={() => navigation.navigate('AIAssistantScreen', { mode: 'emergency' })}>
                        <Text style={styles.primaryActionText}>Start Emergency Consultation with Dr. iSHA</Text>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </TouchableOpacity>


                    <View style={styles.bulletPoints}>
                        {['Real-time urgency assessment', 'Voice-enabled (hands-free)', 'Visual symptom analysis', '24/7 AI assistance'].map((point, index) => (
                            <View key={index} style={styles.bulletRow}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                <Text style={styles.bulletText}>{point}</Text>
                            </View>
                        ))}
                    </View>
                </LinearGradient>

                {/* Online Doctor Section */}
                <View style={[styles.sectionCard, { backgroundColor: COLORS.white }]}>
                    <Text style={styles.sectionTitle}>Connect to Online Doctor</Text>
                    <Text style={styles.sectionSubtitle}>Video consultation with emergency physician</Text>

                    <View style={styles.statusBadge}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>2 Doctor(s) Online</Text>
                    </View>

                    <View style={styles.tipBox}>
                        <Text style={styles.tipText}>
                            🩺 <Text style={{ fontWeight: '700' }}>Instant Video Consultation:</Text> Connect directly with an emergency doctor for immediate medical guidance through video call.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.connectNowButton}
                        onPress={() => navigation.navigate('OnlineConsultationScreen')}
                    >
                        <Text style={styles.connectNowText}>Connect Now (Next Available)</Text>
                    </TouchableOpacity>


                    <Text style={styles.subLabel}>Online Emergency Doctors (2)</Text>
                    {onlineDoctors.map((doc) => (
                        <View key={doc.id} style={styles.doctorCard}>
                            <Image source={{ uri: doc.image }} style={styles.doctorImg} />
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>{doc.name}</Text>
                                <Text style={styles.doctorSpecialty}>• {doc.specialty} • ⭐ {doc.rating} • {doc.fee}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.smallConnectBtn}
                                onPress={() => navigation.navigate('OnlineConsultationScreen', { doctor: doc })}
                            >
                                <Text style={styles.smallConnectText}>Connect</Text>
                            </TouchableOpacity>

                        </View>
                    ))}
                </View>

                {/* Immediate SOS Section */}
                <LinearGradient
                    colors={['#FEF2F2', '#FEE2E2']}
                    style={styles.sectionCard}
                >
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconBg, { backgroundColor: COLORS.emergency }]}>
                            <Text style={{ color: COLORS.white, fontWeight: '900', fontSize: 12 }}>SOS</Text>
                        </View>
                        <View style={styles.sectionHeaderText}>
                            <Text style={styles.sectionTitle}>Immediate SOS</Text>
                            <Text style={styles.sectionSubtitle}>Trigger emergency alerts</Text>
                        </View>
                    </View>
                    <Text style={styles.description}>Share live location with trusted contacts and auto-dial emergency services.</Text>

                    <TouchableOpacity
                        style={styles.sosButtonBig}
                        onPress={handleSOS}
                    >
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.sosButtonInner}
                        >
                            <Ionicons name="megaphone" size={40} color={COLORS.white} />
                            <Text style={styles.sosButtonText}>Press for Emergency</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.manageContactsBtn}
                        onPress={() => navigation.navigate('SOSContactMainScreen')}
                    >
                        <Text style={styles.manageContactsText}>Manage Emergency Contacts</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Emergency Numbers */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Emergency Numbers</Text>
                    <Text style={styles.sectionSubtitle}>Quick access to national emergency helplines.</Text>

                    <View style={styles.numbersGrid}>
                        {emergencyNumbers.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.numberCard}
                                onPress={() => handleCall(item.number)}
                            >
                                <Ionicons name={item.icon} size={24} color={COLORS.emergency} />
                                <View style={styles.numberInfo}>
                                    <Text style={styles.numberTitle}>{item.title}</Text>
                                    <Text style={styles.numberSubtitle}>{item.subtitle}</Text>
                                </View>
                                <Text style={styles.numberValue}>{item.number}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Map & Nearby Hospitals */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Live Map & Directions</Text>
                    <Text style={styles.sectionSubtitle}>Locate emergency-ready hospitals near you.</Text>

                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            region={region}
                        >
                            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="Your Location" />
                            {nearbyHospitals.map(h => (
                                <Marker
                                    key={h.id}
                                    coordinate={{ latitude: h.lat, longitude: h.lng }}
                                    title={h.name}
                                    pinColor={COLORS.emergency}
                                />
                            ))}
                        </MapView>
                        <TouchableOpacity style={styles.mapCenterBtn}>
                            <Ionicons name="locate" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationInfo}>
                        <Ionicons name="location" size={16} color={COLORS.emergency} />
                        <Text style={styles.locationText}>16.0819, 80.1697</Text>
                        <Text style={styles.locationApprox}>GPS unavailable. Using approximate location.</Text>
                    </View>

                    <Text style={styles.subLabel}>Nearby Hospitals</Text>
                    {nearbyHospitals.map((hosp) => (
                        <View key={hosp.id} style={styles.hospitalCard}>
                            <View style={styles.hospHeader}>
                                <View style={styles.hospMain}>
                                    <Text style={styles.hospName}>{hosp.name}</Text>
                                    <View style={styles.hospSub}>
                                        <Text style={styles.hospType}>{hosp.type}</Text>
                                        <Text style={styles.hospDist}>• {hosp.distance} away</Text>
                                    </View>
                                    <Text style={styles.hospArea}>{hosp.area}</Text>
                                </View>
                                {hosp.status && (
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusPillText}>{hosp.status}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.hospActions}>
                                {hosp.phone && (
                                    <TouchableOpacity style={[styles.hospBtn, styles.callBtn]} onPress={() => handleCall(hosp.phone)}>
                                        <Ionicons name="call" size={16} color={COLORS.primary} />
                                        <Text style={styles.hospBtnText}>Call</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.hospBtn, styles.routeBtn]}
                                    onPress={() => {
                                        const url = Platform.select({
                                            ios: `maps:0,0?q=${hosp.name}@${hosp.lat},${hosp.lng}`,
                                            android: `geo:0,0?q=${hosp.lat},${hosp.lng}(${hosp.name})`,
                                        });
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Ionicons name="navigate" size={16} color={COLORS.white} />
                                    <Text style={[styles.hospBtnText, { color: COLORS.white }]}>Map Route</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.hospBtn, styles.googleBtn]}
                                    onPress={() => {
                                        const url = `https://www.google.com/maps/search/?api=1&query=${hosp.lat},${hosp.lng}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <Ionicons name="logo-google" size={16} color={COLORS.textSecondary} />
                                    <Text style={[styles.hospBtnText, { color: COLORS.textSecondary }]}>Google Maps</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.showMoreBtn}>
                        <Text style={styles.showMoreText}>Show more (45 more)</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        padding: wp(4),
    },
    introText: {
        fontSize: moderateScale(14),
        color: COLORS.textSecondary,
        marginBottom: hp(2),
        lineHeight: 20,
    },
    sectionCard: {
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(2),
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        marginBottom: verticalScale(16),
    },
    iconBg: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    sectionHeaderText: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: moderateScale(12),
        fontWeight: '800',
        color: COLORS.aiPurple,
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    sectionSubtitle: {
        fontSize: moderateScale(12),
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    aiActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: verticalScale(20),
    },
    aiActionButton: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: scale(12),
        borderRadius: scale(12),
        width: (width - wp(20)) / 3,
        borderWidth: 1,
        borderColor: '#DDD6FE',
    },
    aiActionText: {
        fontSize: moderateScale(12),
        color: COLORS.aiPurple,
        fontWeight: '600',
        marginTop: 4,
    },
    primaryActionButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: scale(12),
        marginBottom: verticalScale(16),
    },
    primaryActionText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: moderateScale(14),
        marginRight: 8,
    },
    bulletPoints: {
        marginTop: 8,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    bulletText: {
        fontSize: moderateScale(12),
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 10,
        marginBottom: 15,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#166534',
    },
    tipBox: {
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        marginBottom: 15,
    },
    tipText: {
        fontSize: 12,
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    connectNowButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    connectNowText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    subLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        marginTop: 5,
    },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
    },
    doctorImg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.border,
    },
    doctorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    doctorSpecialty: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    smallConnectBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    smallConnectText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    sosButtonBig: {
        alignSelf: 'center',
        marginBottom: 20,
        shadowColor: COLORS.emergency,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    sosButtonInner: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 6,
        borderColor: '#FEE2E2',
    },
    sosButtonText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        width: '80%',
    },
    manageContactsBtn: {
        alignSelf: 'center',
        padding: 10,
    },
    manageContactsText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    numbersGrid: {
        marginTop: 10,
    },
    numberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
    },
    numberInfo: {
        flex: 1,
        marginLeft: 15,
    },
    numberTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    numberSubtitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    numberValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.emergency,
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapCenterBtn: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        backgroundColor: COLORS.white,
        padding: 10,
        borderRadius: 30,
        elevation: 5,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 10,
        marginBottom: 20,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginLeft: 5,
        marginRight: 10,
    },
    locationApprox: {
        fontSize: 11,
        color: COLORS.textSecondary,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    hospitalCard: {
        padding: 15,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 15,
    },
    hospHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    hospMain: {
        flex: 1,
    },
    hospName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    hospSub: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    hospType: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    hospDist: {
        fontSize: 12,
        color: COLORS.primary,
        marginLeft: 5,
        fontWeight: '600',
    },
    hospArea: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    statusPill: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        height: 25,
    },
    statusPillText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D97706',
    },
    hospActions: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 8,
    },
    hospBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        flex: 1,
    },
    callBtn: {
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    routeBtn: {
        backgroundColor: COLORS.primary,
    },
    googleBtn: {
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hospBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
        marginLeft: 4,
    },
    showMoreBtn: {
        alignItems: 'center',
        padding: 12,
        marginTop: 5,
    },
    showMoreText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
});

export default EmergencyServicesScreen;
