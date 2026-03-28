import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const benefits = [
    {
        id: 1,
        title: 'Top Specialists',
        description: 'Consult with high-quality certified doctors across 20+ specialties.',
        icon: 'star',
        color: '#FFD700',
    },
    {
        id: 2,
        title: 'Instant Booking',
        description: 'Skip the wait and get connected to a doctor in minutes.',
        icon: 'flash',
        color: '#F1C40F',
    },
    {
        id: 3,
        title: 'Safe & Secure',
        description: 'Your health records and consultation logs are fully encrypted.',
        icon: 'shield-checkmark',
        color: '#4CAF50',
    },
    {
        id: 4,
        title: 'Digital Prescriptions',
        description: 'Receive digital prescriptions that you can use at any pharmacy.',
        icon: 'document-text',
        color: '#23238E',
    },
    {
        id: 5,
        title: 'Free Follow-up',
        description: 'Get free follow-up chat with the doctor for up to 3 days.',
        icon: 'chatbubbles',
        color: '#9B59B6',
    },
];

export default function BenefitsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>OP Benefits</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        colors={['#23238E', '#4B4BBF']}
                        style={styles.heroSection}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.heroTitle}>Why Choose Mediqzt{'\n'}Online Consultation?</Text>
                        <Text style={styles.heroSubtitle}>Your health, our priority - Anytime, Anywhere.</Text>
                    </LinearGradient>

                    <View style={styles.content}>
                        {benefits.map((benefit) => (
                            <View key={benefit.id} style={styles.benefitCard}>
                                <View style={[styles.iconBox, { backgroundColor: `${benefit.color}15` }]}>
                                    <Ionicons name={benefit.icon} size={moderateScale(24)} color={benefit.color} />
                                </View>
                                <View style={styles.benefitInfo}>
                                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                                    <Text style={styles.benefitDesc}>{benefit.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Know Your Benefits Button */}
                    <TouchableOpacity
                        style={styles.knowBenefitsBtn}
                        onPress={() => navigation.navigate('MyPlansScreen')}
                    >
                        <Ionicons name="card-outline" size={moderateScale(18)} color="#23238E" />
                        <Text style={styles.knowBenefitsBtnText}>View My Active Plans & Usage</Text>
                        <Ionicons name="chevron-forward" size={moderateScale(18)} color="#23238E" />
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('ConsultationScreen')}
                    >
                        <Text style={styles.actionBtnText}>Start Consultation</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    backBtn: {
        width: scale(36),
        height: scale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(17),
        fontWeight: '700',
        color: '#222',
    },
    placeholder: { width: scale(36) },

    heroSection: {
        paddingHorizontal: wp(8),
        paddingVertical: hp(6),
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        lineHeight: moderateScale(28),
    },
    heroSubtitle: {
        fontSize: moderateScale(13),
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: hp(1.5),
    },
    content: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        backgroundColor: '#F5F7FA',
        borderTopLeftRadius: scale(25),
        borderTopRightRadius: scale(25),
        marginTop: -hp(3),
    },
    benefitCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: wp(5),
        borderRadius: scale(16),
        marginBottom: hp(1.5),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    iconBox: {
        width: scale(52),
        height: scale(52),
        borderRadius: scale(26),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(4),
    },
    benefitInfo: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#222',
        marginBottom: hp(0.5),
    },
    benefitDesc: {
        fontSize: moderateScale(12),
        color: '#666',
        lineHeight: moderateScale(18),
    },
    actionBtn: {
        backgroundColor: '#23238E',
        marginHorizontal: wp(5),
        marginVertical: hp(4),
        paddingVertical: hp(2),
        borderRadius: scale(14),
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: 'bold',
    },
    knowBenefitsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F4FF',
        marginHorizontal: wp(5),
        marginTop: hp(1.5),
        paddingVertical: hp(2),
        paddingHorizontal: wp(5),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#23238E',
    },
    knowBenefitsBtnText: {
        flex: 1,
        marginLeft: wp(3),
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#23238E',
    },
});
