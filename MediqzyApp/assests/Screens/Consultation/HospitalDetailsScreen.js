import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

export default function HospitalDetailsScreen({ navigation, route }) {
    const hospital = route?.params?.hospital || {
        name: 'Apollo Hospitals',
        location: 'Valechery, Chennai 600017',
        distance: '2.5 km',
        rating: 4.5,
    };

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(15) }}>
                {/* Banner with Back Button */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={require('../../images/apollo.png')}
                        style={styles.hospitalImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Hospital Details */}
                <View style={styles.infoContent}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.hospitalName}>{hospital.name}</Text>
                            <Text style={styles.hospitalType}>Multi Speciality Hospital</Text>
                        </View>
                        <View style={styles.ratingBox}>
                            <Ionicons name="star" size={moderateScale(16)} color="#FFD700" />
                            <Text style={styles.ratingText}>{hospital.rating}</Text>
                        </View>
                    </View>

                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={moderateScale(18)} color="#E53935" />
                        <Text style={styles.locationText}>{hospital.location}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="people" size={moderateScale(20)} color="#23238E" />
                            <Text style={styles.statValue}>100+</Text>
                            <Text style={styles.statLabel}>Doctors</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Ionicons name="bed" size={moderateScale(20)} color="#23238E" />
                            <Text style={styles.statValue}>500+</Text>
                            <Text style={styles.statLabel}>Beds</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Ionicons name="time" size={moderateScale(20)} color="#23238E" />
                            <Text style={styles.statValue}>24/7</Text>
                            <Text style={styles.statLabel}>Emergency</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>About Hospital</Text>
                    <Text style={styles.description}>
                        Apollo Hospitals is one of the leading multi-speciality hospitals in Chennai, providing world-class healthcare services. Equipped with state-of-the-art technology and a team of highly experienced doctors, we are committed to excellence in patient care.
                    </Text>

                    <Text style={styles.sectionTitle}>Specialities</Text>
                    <View style={styles.specialitiesGrid}>
                        {['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Pediatrics', 'Oncology'].map((spec, index) => (
                            <View key={index} style={styles.specBadge}>
                                <Text style={styles.specText}>{spec}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Booking Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.consultText}>Consultation Fee</Text>
                    <Text style={styles.priceValue}>Rs. 800</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate('BookAppointmentScreen', { tab: 'hospital' })}
                >
                    <Text style={styles.bookBtnText}>Book Visit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    bannerContainer: { position: 'relative' },
    hospitalImage: { width: wp(100), height: verticalScale(250) },
    headerBackBtn: {
        position: 'absolute',
        top: hp(5),
        left: wp(4),
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        padding: scale(20),
        marginTop: verticalScale(-20),
        backgroundColor: '#fff',
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    hospitalName: {
        fontSize: moderateScale(22),
        fontWeight: 'bold',
        color: '#222',
    },
    hospitalType: {
        fontSize: moderateScale(14),
        color: '#888',
        marginTop: verticalScale(4),
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E1',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(8),
        gap: scale(4),
    },
    ratingText: {
        fontSize: moderateScale(15),
        fontWeight: 'bold',
        color: '#F1C40F',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(16),
        gap: scale(8),
    },
    locationText: {
        fontSize: moderateScale(14),
        color: '#555',
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#F7F9FC',
        borderRadius: scale(20),
        paddingVertical: verticalScale(20),
        marginTop: verticalScale(24),
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#222',
        marginTop: verticalScale(6),
    },
    statLabel: {
        fontSize: moderateScale(12),
        color: '#888',
        marginTop: verticalScale(2),
    },
    divider: {
        width: scale(1),
        height: verticalScale(30),
        backgroundColor: '#E0E8F2',
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#222',
        marginTop: verticalScale(30),
        marginBottom: verticalScale(12),
    },
    description: {
        fontSize: moderateScale(14),
        color: '#666',
        lineHeight: moderateScale(22),
    },
    specialitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(10),
        marginTop: verticalScale(4),
    },
    specBadge: {
        backgroundColor: '#F0F4FF',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(12),
    },
    specText: {
        fontSize: moderateScale(13),
        color: '#23238E',
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        paddingBottom: hp(4),
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 8,
    },
    consultText: {
        fontSize: moderateScale(12),
        color: '#888',
    },
    priceValue: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#222',
    },
    bookBtn: {
        backgroundColor: '#23238E',
        paddingHorizontal: wp(10),
        paddingVertical: verticalScale(16),
        borderRadius: scale(14),
    },
    bookBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});
