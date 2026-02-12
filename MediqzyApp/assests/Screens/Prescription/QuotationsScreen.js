import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const categories = ['Diabetes', 'Heart Health', 'Liver Health'];
const labs = [
    { id: 1, name: 'Apollo Labs', address: 'T.nagar, Chennai 600017' },
    { id: 2, name: 'Apollo Labs', address: 'T.nagar, Chennai 600017' },
    { id: 3, name: 'Apollo Labs', address: 'T.nagar, Chennai 600017' },
    { id: 4, name: 'Apollo Labs', address: 'T.nagar, Chennai 600017' },
    { id: 5, name: 'Apollo Labs', address: 'T.nagar, Chennai 600017' },
];

export default function QuotationsScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [labsView, setLabsView] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Labs/Tests</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchBarRow}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={moderateScale(20)} color="#888" style={{ marginLeft: scale(12) }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Test Name"
                            placeholderTextColor="#999"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Ionicons name="options-outline" size={moderateScale(22)} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Toggle & Categories */}
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toggleRow} contentContainerStyle={styles.toggleRowContent}>
                        <View style={styles.labsViewToggle}>
                            <Text style={styles.labsViewText}>Labs View</Text>
                            <Switch
                                value={labsView}
                                onValueChange={setLabsView}
                                trackColor={{ false: '#ccc', true: '#194E9D' }}
                                thumbColor="#fff"
                            />
                        </View>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === idx && styles.categoryChipActive]}
                                onPress={() => setSelectedCategory(selectedCategory === idx ? null : idx)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === idx && styles.categoryTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Section Title */}
                <Text style={styles.sectionTitle}>Labs Near You...</Text>

                {/* Labs List */}
                <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    {labs
                        .filter((lab) => lab.name.toLowerCase().includes(search.toLowerCase()))
                        .map((lab) => (
                            <TouchableOpacity key={lab.id} style={styles.labCard} onPress={() => navigation.navigate('LabDetailsScreen')}>
                                <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
                                <View style={styles.labInfo}>
                                    <Text style={styles.labName}>{lab.name}</Text>
                                    <Text style={styles.labAddress}>{lab.address}</Text>
                                </View>
                                <TouchableOpacity style={styles.phoneBtn}>
                                    <Ionicons name="call-outline" size={moderateScale(22)} color="#22C55E" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    <View style={{ height: verticalScale(30) }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    safeArea: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        width: scale(40),
        padding: scale(4),
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: wp(4),
        marginVertical: verticalScale(16),
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: scale(12),
        paddingVertical: verticalScale(2),
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    searchInput: {
        flex: 1,
        fontSize: moderateScale(15),
        marginLeft: scale(8),
        color: '#222',
        paddingVertical: verticalScale(10),
    },
    filterBtn: {
        marginLeft: scale(12),
        padding: scale(10),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(10),
    },
    toggleRow: {
        marginBottom: verticalScale(16),
    },
    toggleRowContent: {
        paddingLeft: wp(4),
        paddingRight: wp(4),
        alignItems: 'center',
    },
    labsViewToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: scale(10),
        paddingHorizontal: scale(12),
        marginRight: scale(10),
        borderWidth: 1,
        borderColor: '#194E9D',
        height: verticalScale(44),
    },
    labsViewText: {
        color: '#333',
        fontWeight: '600',
        fontSize: moderateScale(14),
        marginRight: scale(8)
    },
    categoryChip: {
        borderWidth: 1,
        borderColor: '#23238E',
        borderRadius: scale(10),
        paddingHorizontal: scale(20),
        marginRight: scale(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: verticalScale(44),
    },
    categoryChipActive: { backgroundColor: '#23238E' },
    categoryText: { color: '#333', fontWeight: '500', fontSize: moderateScale(14), textAlign: 'center' },
    categoryTextActive: { color: '#fff' },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: wp(4),
        marginBottom: verticalScale(16),
    },
    listContainer: { flex: 1 },
    listContent: { paddingHorizontal: wp(4), paddingBottom: hp(2) },
    labCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(12),
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    labLogo: { width: scale(50), height: scale(50), borderRadius: scale(10), marginRight: scale(12) },
    labInfo: { flex: 1 },
    labName: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#222', marginBottom: verticalScale(4) },
    labAddress: { fontSize: moderateScale(13), color: '#6B7280' },
    phoneBtn: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
    },
});

