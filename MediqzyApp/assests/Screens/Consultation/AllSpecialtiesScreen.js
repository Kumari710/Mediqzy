import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const allSpecialities = [
    { id: 1, name: 'General Medicine', icon: 'medkit-outline', desc: 'Fever, Cold, General Health' },
    { id: 2, name: 'Cardiology', icon: 'heart-outline', desc: 'Heart related issues' },
    { id: 3, name: 'Dermatology', icon: 'sparkles-outline', desc: 'Skin, Hair, Nails' },
    { id: 4, name: 'Pediatrics', icon: 'happy-outline', desc: 'Child healthcare' },
    { id: 5, name: 'Orthopedics', icon: 'accessibility-outline', desc: 'Bones, Joints, Muscles' },
    { id: 6, name: 'Neurology', icon: 'pulse-outline', desc: 'Brain and Nervous system' },
    { id: 7, name: 'Gynecology', icon: 'woman-outline', desc: 'Womens health' },
    { id: 8, name: 'Dentistry', icon: 'skull-outline', desc: 'Dental and Oral health' },
    { id: 9, name: 'Ophthalmology', icon: 'eye-outline', desc: 'Eye related issues' },
    { id: 10, name: 'Psychiatry', icon: 'brain-outline', desc: 'Mental health' },
    { id: 11, name: 'ENT Specialist', icon: 'ear-outline', desc: 'Ear, Nose, Throat' },
    { id: 12, name: 'Endocrinology', icon: 'flask-outline', desc: 'Diabetes, Hormones' },
];

export default function AllSpecialtiesScreen({ navigation }) {
    const [search, setSearch] = useState('');

    const filteredSpecialities = allSpecialities.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Specialities</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={moderateScale(20)} color="#888" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search specialities..."
                            placeholderTextColor="#888"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.grid}>
                        {filteredSpecialities.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('OnlineConsultationScreen', { specialty: item.name })}
                            >
                                <View style={styles.iconBox}>
                                    <Ionicons name={item.icon} size={moderateScale(32)} color="#23238E" />
                                </View>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {filteredSpecialities.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={moderateScale(48)} color="#ccc" />
                            <Text style={styles.emptyText}>No specialities found matching "{search}"</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    safeArea: { flex: 1 },
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
        width: scale(40),
        padding: scale(4),
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
    searchContainer: {
        padding: scale(16),
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: scale(12),
        paddingHorizontal: scale(12),
        height: verticalScale(50),
    },
    searchInput: {
        flex: 1,
        marginLeft: scale(10),
        fontSize: moderateScale(14),
        color: '#222',
    },
    scrollContent: { paddingBottom: hp(4) },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: scale(12),
        gap: scale(12),
    },
    card: {
        width: (wp(100) - scale(36)) / 2,
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(32),
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    name: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#222',
        textAlign: 'center',
        marginBottom: verticalScale(4),
    },
    desc: {
        fontSize: moderateScale(11),
        color: '#888',
        textAlign: 'center',
        lineHeight: moderateScale(16),
    },
    emptyState: {
        alignItems: 'center',
        marginTop: hp(10),
        paddingHorizontal: wp(10),
    },
    emptyText: {
        fontSize: moderateScale(14),
        color: '#888',
        textAlign: 'center',
        marginTop: verticalScale(12),
    },
});
