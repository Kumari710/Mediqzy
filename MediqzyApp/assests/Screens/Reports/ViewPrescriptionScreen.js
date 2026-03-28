import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

export default function ViewPrescriptionScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);

    // Safely extract item data with fallbacks
    const item = route?.params?.prescription || route?.params?.appointment || route?.params?.item || {};

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const prescription = {
        doctor: item?.doctor?.name || item?.doctor || 'Dr.Vijaya Kumar',
        degree: 'MBBS',
        specialty: item?.doctor?.specialty || item?.specialty || 'General Physician',
        regNo: 'TMghu38768',
        clinic: 'Apollo 24/7 Doctors,\nApollo Health City, Chennai',
        phone: '+91-8457254844',
        email: 'apollo@247.com',
        patientName: item?.patientName || item?.patient?.name || 'Vijay',
        gender: item?.gender || item?.patient?.gender || 'Male',
        age: item?.age || item?.patient?.age || '50 Yrs',
        mobile: '+91 - 8976512345',
        uhid: 'API12873458789',
        date: item?.date || 'Saturday, 1 st Dec 2024',
        time: item?.time || '4:40 PM',
        consultType: item?.type === 'online' ? 'Online' : 'Online',
        appointmentId: 'AP12345',
        complaints: item?.problem || 'Anemia: Since : 5Yrs',
        vitals: {
            drugAllergies: 'No',
            dietAllergies: 'No'
        },
        diagnosis: item?.diagnosis || 'Anemia',
        medications: [
            {
                name: '1. MENABOL TABLET 20 \'S',
                contains: 'Contains : STANOZOLOL (2 MG)',
                dosage: '0-0-0-1',
                timing: 'M-N-E-N',
                type: 'TABLET',
                instruction: 'Orally - After food'
            }
        ],
        advice: [
            'MAINTAIN HEALTHY DIET',
            'EXERCISE REGULARLY',
            'DRINK PLENTY OF WATER'
        ]
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>View Prescription</Text>
                        <View style={styles.rightHeader} />
                    </View>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#23238E" />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>View Prescription</Text>
                    <TouchableOpacity style={styles.rightHeader}>
                        <Ionicons name="download-outline" size={moderateScale(24)} color="#23238E" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Doctor Letterhead Section */}
                    <View style={styles.letterhead}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../../images/apollo.png')} style={styles.apolloLogo} />
                        </View>
                        <View style={styles.doctorHeaderInfo}>
                            <Text style={styles.letterDoctorName}>{prescription.doctor}</Text>
                            <Text style={styles.letterDegree}>{prescription.degree}</Text>
                            <Text style={styles.letterSpecialty}>{prescription.specialty}</Text>
                            <Text style={styles.letterRegNo}>Reg.No. {prescription.regNo}</Text>
                        </View>
                        <View style={styles.doctorContactInfo}>
                            <Text style={styles.letterClinic}>{prescription.clinic}</Text>
                            <View style={styles.contactRow}>
                                <Ionicons name="logo-whatsapp" size={scale(14)} color="#25D366" />
                                <Text style={styles.contactText}>{prescription.phone}</Text>
                            </View>
                            <View style={styles.contactRow}>
                                <Ionicons name="mail-outline" size={scale(14)} color="#E63946" />
                                <Text style={styles.contactText}>{prescription.email}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Patient & Consultation Meta */}
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <View style={styles.metaCol}>
                                <Text style={styles.metaLabel}>Patient</Text>
                                <Text style={styles.metaValue}>{prescription.patientName}, {prescription.gender}, {prescription.age}</Text>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>Mobile:</Text> {prescription.mobile}</Text>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>UHID:</Text> {prescription.uhid}</Text>
                            </View>
                            <View style={styles.metaColRight}>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>Date:</Text> {prescription.date}</Text>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>Time:</Text> {prescription.time}</Text>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>Consult Type:</Text> {prescription.consultType}</Text>
                                <Text style={styles.metaValue}><Text style={styles.metaLabelSmall}>Appointment ID:</Text> {prescription.appointmentId}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.bodyContent}>
                        <Text style={styles.contentSectionTitle}>Chief Complaints</Text>
                        <Text style={styles.bulletItem}>• {prescription.complaints}</Text>

                        <Text style={styles.contentSectionTitle}>Vitals <Text style={styles.subtitleThin}>(as declared by patient):</Text></Text>
                        <Text style={styles.bulletItem}>• Drug Allergies: {prescription.vitals.drugAllergies}</Text>
                        <Text style={styles.bulletItem}>• Diet Allergies/Restrictions: {prescription.vitals.dietAllergies}</Text>

                        <Text style={styles.contentSectionTitle}>Diagnosis / Provisional Diagnosis</Text>
                        <Text style={styles.bulletItem}>• {prescription.diagnosis}</Text>

                        <Text style={[styles.contentSectionTitle, { marginTop: hp(3), color: '#23238E' }]}>Medication Prescribed</Text>

                        {/* Medication Table Header */}
                        <View style={styles.medTableHeader}>
                            <Text style={[styles.medHeadLabel, { flex: 3 }]}>Medicine Name</Text>
                            <Text style={[styles.medHeadLabel, { flex: 1.5, textAlign: 'center' }]}>Dosage</Text>
                            <Text style={[styles.medHeadLabel, { flex: 1.5, textAlign: 'center' }]}>Medicine Type</Text>
                        </View>

                        {/* Medication Item */}
                        {prescription.medications.map((med, index) => (
                            <View key={index} style={styles.medItemRow}>
                                <View style={{ flex: 3 }}>
                                    <Text style={styles.medNameText}>{med.name}</Text>
                                    <Text style={styles.medContains}>{med.contains}</Text>
                                </View>
                                <View style={{ flex: 1.5, alignItems: 'center' }}>
                                    <Text style={styles.medDosageText}>{med.dosage}</Text>
                                    <Text style={styles.medTimingText}>{med.timing}</Text>
                                </View>
                                <View style={{ flex: 1.5, alignItems: 'center' }}>
                                    <Text style={styles.medTypeText}>{med.type}</Text>
                                    <Text style={styles.medInstrText}>{med.instruction}</Text>
                                </View>
                            </View>
                        ))}

                        {/* Legends */}
                        <View style={styles.legendContainer}>
                            <View style={styles.legendBox}>
                                <Text style={styles.legendText}><Text style={{ fontWeight: 'bold' }}>M - N - E - N :</Text> Morning - Noon - Evening - Night</Text>
                            </View>
                            <View style={styles.legendBox}>
                                <Text style={styles.legendText}><Text style={{ fontWeight: 'bold' }}>Note :</Text> Medicine Substitution Allowed</Text>
                            </View>
                        </View>

                        <Text style={styles.contentSectionTitle}>Advice & Instructions</Text>
                        {prescription.advice.map((adv, idx) => (
                            <Text key={idx} style={styles.bulletItem}>• {adv}</Text>
                        ))}

                        {/* Signature Section */}
                        <View style={styles.signatureSection}>
                            <Text style={styles.signatureFont}>{prescription.doctor.replace('Dr.', '')}</Text>
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureLabel}>SIGNATURE</Text>
                        </View>

                        {/* Disclaimer */}
                        <View style={styles.disclaimerBox}>
                            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
                            <Text style={styles.disclaimerText}>
                                This prescription is issued on the basis of your inputs during teleconsulation It is valid from the date of issue until the specific period / dosage of each medicine as advised.
                            </Text>
                        </View>

                        <Text style={styles.pageCount}>Page 1 of 1</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
    },
    backBtn: { width: scale(40) },
    rightHeader: { width: scale(40), alignItems: 'flex-end' },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#333' },

    scrollContent: { paddingBottom: hp(5) },

    // Letterhead
    letterhead: {
        flexDirection: 'row',
        padding: wp(4),
        borderBottomWidth: 5,
        borderBottomColor: '#F5F5F5',
        alignItems: 'flex-start',
    },
    logoContainer: {
        width: scale(70),
        height: scale(70),
        backgroundColor: '#fff',
        borderRadius: scale(8),
        padding: scale(5),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    apolloLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    doctorHeaderInfo: {
        flex: 1.2,
        marginLeft: wp(3),
    },
    letterDoctorName: { fontSize: moderateScale(16), fontWeight: '800', color: '#23238E' },
    letterDegree: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#333', marginTop: 2 },
    letterSpecialty: { fontSize: moderateScale(12), color: '#666' },
    letterRegNo: { fontSize: moderateScale(12), color: '#666', marginTop: 2 },
    doctorContactInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    letterClinic: { fontSize: moderateScale(10), color: '#666', textAlign: 'right', marginBottom: 5 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    contactText: { fontSize: moderateScale(10), color: '#444' },

    // Meta Section
    metaSection: {
        padding: wp(4),
        backgroundColor: '#fff',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaCol: { flex: 1.2 },
    metaColRight: { flex: 1, alignItems: 'flex-end' },
    metaLabel: { fontSize: moderateScale(16), fontWeight: '800', color: '#23238E', marginBottom: 8 },
    metaLabelSmall: { fontWeight: 'bold', color: '#333' },
    metaValue: { fontSize: moderateScale(13), color: '#444', marginBottom: 4 },

    // Body Content
    bodyContent: {
        paddingHorizontal: wp(4),
    },
    contentSectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: '#23238E',
        marginTop: hp(2.5),
        marginBottom: hp(1),
    },
    subtitleThin: { fontWeight: '400', fontSize: moderateScale(14), color: '#23238E' },
    bulletItem: {
        fontSize: moderateScale(14),
        color: '#333',
        marginBottom: 5,
        marginLeft: wp(2),
    },

    // Medication Table
    medTableHeader: {
        flexDirection: 'row',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        borderStyle: 'dashed',
    },
    medHeadLabel: { fontSize: moderateScale(14), fontWeight: '700', color: '#333' },
    medItemRow: {
        flexDirection: 'row',
        paddingVertical: hp(2),
    },
    medNameText: { fontSize: moderateScale(14), fontWeight: '800', color: '#111' },
    medContains: { fontSize: moderateScale(12), color: '#666', marginTop: 4 },
    medDosageText: { fontSize: moderateScale(16), fontWeight: '800', color: '#111' },
    medTimingText: { fontSize: moderateScale(12), fontWeight: 'bold', color: '#333', marginTop: 2 },
    medTypeText: { fontSize: moderateScale(14), fontWeight: '800', color: '#111' },
    medInstrText: { fontSize: moderateScale(12), color: '#666', marginTop: 2 },

    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp(4),
        marginTop: hp(1),
    },
    legendBox: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: scale(5),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    legendText: { fontSize: moderateScale(10), color: '#333' },

    // Signature
    signatureSection: {
        alignItems: 'flex-start',
        marginTop: hp(5),
        marginLeft: wp(4),
    },
    signatureFont: {
        fontSize: moderateScale(22),
        color: '#333',
        fontStyle: 'italic',
    },
    signatureLine: {
        width: wp(35),
        height: 1,
        backgroundColor: '#999',
        marginVertical: 5,
    },
    signatureLabel: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#444' },

    // Disclaimer
    disclaimerBox: {
        marginTop: hp(4),
    },
    disclaimerTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#333', marginBottom: 5 },
    disclaimerText: { fontSize: moderateScale(12), color: '#666', lineHeight: moderateScale(18) },

    pageCount: {
        textAlign: 'right',
        fontSize: moderateScale(12),
        color: '#666',
        marginTop: hp(3),
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
