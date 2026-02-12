import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#23238E',
    secondary: '#3B4FBF',
    white: '#FFFFFF',
    background: '#F5F5F5',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    chatGreen: '#4CAF50',
    callGreen: '#4CAF50',
};

const TRACKING_STEPS = [
    { id: 1, title: 'Requirement packed', subtitle: 'Your test requirements are ready' },
    { id: 2, title: 'Nurse on the way', subtitle: 'Nurse has started towards your location' },
    { id: 3, title: 'Arrived at customer location', subtitle: 'Nurse has arrived at your address' },
    { id: 4, title: 'Sample collected', subtitle: 'Sample collection in progress' },
    { id: 5, title: 'Payment Done', subtitle: 'Payment completed successfully' },
];

const DEFAULT_LOCATION = {
    latitude: 28.6915,
    longitude: 77.1498,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function CollectionStatusScreen({ navigation, route }) {
    const { order, orderId } = route.params || {};
    const [currentStep, setCurrentStep] = useState(3); // Default to "Arrived at customer location"
    const [otp, setOtp] = useState('4123');
    const [estimatedTime, setEstimatedTime] = useState('10');

    // Nurse details
    const nurse = {
        name: 'Ria Swami',
        role: 'Nurse',
        rating: 4,
        image: require('../../images/doctor.png'),
        phone: '+919876543210',
    };

    useEffect(() => {
        // Generate random OTP
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setOtp(randomOtp);
    }, []);

    const handleChat = () => {
        // Navigate to chat or open SMS
        navigation.navigate('ChatScreen', { 
            recipientName: nurse.name,
            recipientRole: 'Nurse',
        });
    };

    const handleCall = () => {
        Linking.openURL(`tel:${nurse.phone}`);
    };

    const handleTrackStatus = () => {
        // Move to next step (simulate progress)
        if (currentStep < TRACKING_STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
        
        // If sample collected, navigate to details
        if (currentStep >= 4) {
            navigation.navigate('LabTestDetailsScreen', { order, orderId: order?.id || orderId });
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFB800"
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    const renderTrackingStep = (step, index) => {
        const isCompleted = index + 1 <= currentStep;
        const isLast = index === TRACKING_STEPS.length - 1;

        return (
            <View key={step.id} style={styles.stepContainer}>
                {/* Line connector */}
                {!isLast && (
                    <View style={[
                        styles.stepLine,
                        isCompleted && index + 1 < currentStep ? styles.stepLineCompleted : null
                    ]} />
                )}
                
                {/* Step indicator */}
                <View style={[
                    styles.stepIndicator,
                    isCompleted ? styles.stepIndicatorCompleted : styles.stepIndicatorPending
                ]}>
                    {isCompleted && (
                        <View style={styles.stepInnerDot} />
                    )}
                </View>

                {/* Step content */}
                <View style={styles.stepContent}>
                    <Text style={[
                        styles.stepTitle,
                        isCompleted ? styles.stepTitleCompleted : styles.stepTitlePending
                    ]}>
                        {step.title}
                    </Text>
                    <Text style={styles.stepSubtitle}>Lorem Ipsum</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Collection Status</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Nurse Card */}
                    <View style={styles.nurseCard}>
                        <Image
                            source={nurse.image}
                            style={styles.nurseImage}
                            defaultSource={require('../../images/doctor.png')}
                        />
                        <View style={styles.nurseInfo}>
                            <Text style={styles.nurseName}>{nurse.name}</Text>
                            <Text style={styles.nurseRole}>{nurse.role}</Text>
                            <View style={styles.starsRow}>
                                {renderStars(nurse.rating)}
                            </View>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
                                <Ionicons name="chatbubble-outline" size={22} color={COLORS.chatGreen} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                                <Ionicons name="call-outline" size={22} color={COLORS.callGreen} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Estimated Time */}
                    <View style={styles.etaRow}>
                        <Text style={styles.etaLabel}>Estimated time of Delivery</Text>
                        <Text style={styles.etaValue}>{estimatedTime}Mins</Text>
                    </View>

                    {/* Map Image */}
                    <View style={styles.mapContainer}>
                        <Image
                            source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=28.6915,77.1498&zoom=14&size=600x400&maptype=roadmap' }}
                            style={styles.map}
    
                            resizeMode="cover"
                            defaultSource={require('../../images/labtest.png')}
                        />
                        
                        {/* Location Marker Overlay */}
                        <View style={styles.mapMarkerOverlay}>
                            <Ionicons name="location" size={30} color="#E53935" />
                        </View>
                        
                    </View>

                    {/* Tracking Section */}
                    <View style={styles.trackingSection}>
                        <Text style={styles.trackingTitle}>TRACK YOUR COLLECTION</Text>
                        
                        <View style={styles.stepsContainer}>
                            {TRACKING_STEPS.map((step, index) => renderTrackingStep(step, index))}
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.trackBtn} onPress={handleTrackStatus}>
                        <Text style={styles.trackBtnText}>Track Status</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: COLORS.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp(12),
    },
    nurseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: wp(4),
        marginTop: hp(2),
        padding: wp(4),
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    nurseImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    nurseInfo: {
        flex: 1,
        marginLeft: wp(3),
    },
    nurseName: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: COLORS.text,
    },
    nurseRole: {
        fontSize: moderateScale(13),
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    starsRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    chatBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    callBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    etaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        marginTop: hp(2),
    },
    etaLabel: {
        fontSize: moderateScale(14),
        color: COLORS.text,
        fontWeight: '500',
    },
    etaValue: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: COLORS.text,
    },
    mapContainer: {
        marginHorizontal: wp(4),
        marginTop: hp(1.5),
        height: hp(22),
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    mapMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapMarkerOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -30 }],
    },
    otpBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#FFB800',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    otpText: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: COLORS.white,
    },
    trackingSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: wp(4),
        marginTop: hp(2.5),
        padding: wp(4),
        borderRadius: 12,
    },
    trackingTitle: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: COLORS.text,
        letterSpacing: 0.5,
        marginBottom: hp(2),
    },
    stepsContainer: {
        paddingLeft: wp(1),
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: hp(2),
        position: 'relative',
    },
    stepLine: {
        position: 'absolute',
        left: 9,
        top: 22,
        width: 2,
        height: hp(4.5),
        backgroundColor: COLORS.border,
    },
    stepLineCompleted: {
        backgroundColor: COLORS.primary,
    },
    stepIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },
    stepIndicatorCompleted: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    stepIndicatorPending: {
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    stepInnerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    stepContent: {
        flex: 1,
        paddingTop: 0,
    },
    stepTitle: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    stepTitleCompleted: {
        color: COLORS.text,
    },
    stepTitlePending: {
        color: COLORS.textSecondary,
    },
    stepSubtitle: {
        fontSize: moderateScale(12),
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    trackBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: hp(2),
        alignItems: 'center',
    },
    trackBtnText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: COLORS.white,
    },
});
