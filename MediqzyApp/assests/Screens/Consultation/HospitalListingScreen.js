import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const hospitals = [
    {
        id: 1,
        name: 'Apollo Hospitals',
        location: 'Valechery, Chennai 600017',
        distance: '2.5 km',
        rating: 4.5,
        image: require('../../images/apollo.png'),
        type: 'Multi Speciality',
    },
    {
        id: 2,
        name: 'Fortis Malar Hospital',
        location: 'Adyar, Chennai 600020',
        distance: '4.8 km',
        rating: 4.2,
        image: require('../../images/apollo.png'), // Placeholder
        type: 'Multi Speciality',
    },
    {
        id: 3,
        name: 'MGM Healthcare',
        location: 'Aminjikarai, Chennai 600029',
        distance: '7.2 km',
        rating: 4.8,
        image: require('../../images/apollo.png'), // Placeholder
        type: 'Multi Speciality',
    },
];

export default function HospitalListingScreen({ navigation }) {
    const [search, setSearch] = useState('');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Hospital</Text>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(3) }}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={moderateScale(20)} color="#888" style={{ marginLeft: scale(12) }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Hospital..."
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <Text style={styles.sectionTitle}>Hospitals Near You</Text>

                {hospitals.map((hospital) => (
                    <TouchableOpacity
                        key={hospital.id}
                        style={styles.hospitalCard}
                        onPress={() => navigation.navigate('HospitalDetailsScreen', { hospital })}
                    >
                        <Image source={hospital.image} style={styles.hospitalImage} />
                        <View style={styles.hospitalInfo}>
                            <Text style={styles.hospitalName}>{hospital.name}</Text>
                            <Text style={styles.hospitalType}>{hospital.type}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={moderateScale(14)} color="#E53935" />
                                <Text style={styles.locationText}>{hospital.location}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <View style={styles.ratingBox}>
                                    <Ionicons name="star" size={moderateScale(12)} color="#FFD700" />
                                    <Text style={styles.ratingText}>{hospital.rating}</Text>
                                </View>
                                <Text style={styles.distanceText}>{hospital.distance}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={moderateScale(20)} color="#CCC" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: hp(5),
        paddingHorizontal: wp(4),
        paddingBottom: hp(2),
        backgroundColor: '#fff',
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: scale(12),
        marginHorizontal: wp(4),
        marginTop: verticalScale(16),
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: verticalScale(48),
    },
    searchInput: { flex: 1, fontSize: moderateScale(16), marginLeft: scale(8), color: '#222' },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#222',
        marginHorizontal: wp(4),
        marginTop: verticalScale(24),
        marginBottom: verticalScale(12),
    },
    hospitalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: wp(4),
        marginBottom: verticalScale(12),
        padding: scale(12),
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    hospitalImage: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(12),
        resizeMode: 'cover',
    },
    hospitalInfo: {
        flex: 1,
        marginLeft: scale(12),
    },
    hospitalName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#23238E',
    },
    hospitalType: {
        fontSize: moderateScale(12),
        color: '#888',
        marginTop: verticalScale(2),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    locationText: {
        fontSize: moderateScale(12),
        color: '#555',
        marginLeft: scale(4),
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(8),
        gap: scale(12),
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E1',
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(2),
        borderRadius: scale(4),
        gap: scale(4),
    },
    ratingText: {
        fontSize: moderateScale(12),
        fontWeight: 'bold',
        color: '#F1C40F',
    },
    distanceText: {
        fontSize: moderateScale(12),
        color: '#888',
    },
});
