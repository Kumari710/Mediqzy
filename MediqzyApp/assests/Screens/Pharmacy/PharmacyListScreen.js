import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { searchNearbyHealthcare } from '../../Utils/mapsService';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

// Filter configuration
const FILTERS = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'open', name: 'Open Now', icon: 'time' },
  { id: 'near', name: 'Within 2km', icon: 'navigate' },
  { id: 'rated', name: 'Top Rated', icon: 'star' },
  { id: '24_7', name: '24/7', icon: 'infinite' },
];

const pharmacies = [
  {
    id: 1,
    name: 'Apollo Pharmacy',
    address: '90/8 Rajaji nagar main Rd, Thiruvanmiyur, Chennai',
    distance: '1.2 km',
    distanceValue: 1.2,
    rating: 4.8,
    reviews: 120,
    isOpen: true,
    is24Hours: true,
    logo: require('../../images/apollo.png'),
  },
  {
    id: 2,
    name: 'MedPlus Pharmacy',
    address: 'Adyar Canal Bank Rd, Adyar, Chennai',
    distance: '2.5 km',
    distanceValue: 2.5,
    rating: 4.5,
    reviews: 85,
    isOpen: true,
    is24Hours: false,
    logo: require('../../images/apollo.png'),
  },
  {
    id: 3,
    name: 'Wellness Forever',
    address: 'Thiruvanmiyur, Chennai',
    distance: '3.1 km',
    distanceValue: 3.1,
    rating: 4.2,
    reviews: 64,
    isOpen: false,
    is24Hours: false,
    logo: require('../../images/apollo.png'),
  },
  {
    id: 4,
    name: 'Netmeds Store',
    address: 'Velachery Main Road, Chennai',
    distance: '1.8 km',
    distanceValue: 1.8,
    rating: 4.6,
    reviews: 95,
    isOpen: true,
    is24Hours: true,
    logo: require('../../images/apollo.png'),
  },
];

export default function PharmacyListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [nearbyPharmList, setNearbyPharmList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const results = await searchNearbyHealthcare(12.9716, 80.2452, 'pharmacy');
      if (results && results.length > 0) {
        // Map API results to include required fields
        const mappedResults = results.map((r, i) => ({
          ...r,
          distanceValue: parseFloat(r.distance?.replace(/[^\d.]/g, '')) || i + 1,
          is24Hours: i % 3 === 0, // Demo: every 3rd pharmacy is 24/7
        }));
        setNearbyPharmList(mappedResults);
      } else {
        setNearbyPharmList(pharmacies);
      }
    } catch (error) {
      console.log('Error fetching pharmacies:', error);
      setNearbyPharmList(pharmacies);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters with useMemo for performance
  const filteredPharmacies = useMemo(() => {
    let filtered = nearbyPharmList;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'open':
        filtered = filtered.filter(p => p.isOpen || p.openNow);
        break;
      case 'near':
        filtered = filtered.filter(p => {
          const dist = p.distanceValue || parseFloat(p.distance?.replace(/[^\d.]/g, '')) || 10;
          return dist <= 2;
        });
        break;
      case 'rated':
        filtered = filtered.filter(p => (p.rating || 0) >= 4.5);
        break;
      case '24_7':
        filtered = filtered.filter(p => p.is24Hours);
        break;
      default:
        // 'all' - no additional filter
        break;
    }

    return filtered;
  }, [nearbyPharmList, search, selectedFilter]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Find Pharmacy</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={moderateScale(14)} color="#E53935" />
              <Text style={styles.locationText}>Rajaji Nagar, Chennai</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={moderateScale(24)} color="#23238E" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for pharmacy..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, selectedFilter === filter.id && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={14}
                  color={selectedFilter === filter.id ? '#fff' : '#666'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.filterText, selectedFilter === filter.id && styles.filterTextActive]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>
            Pharmacies Near You {filteredPharmacies.length > 0 ? `(${filteredPharmacies.length})` : ''}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#23238E" style={{ marginTop: 20 }} />
          ) : filteredPharmacies.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={50} color="#CCC" />
              <Text style={styles.emptyTitle}>No pharmacies found</Text>
              <Text style={styles.emptySubtext}>
                {selectedFilter !== 'all'
                  ? `No pharmacies match the "${FILTERS.find(f => f.id === selectedFilter)?.name}" filter`
                  : 'Try adjusting your search or filters'}
              </Text>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => { setSelectedFilter('all'); setSearch(''); }}
              >
                <Text style={styles.clearFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPharmacies.map((pharm) => (
              <TouchableOpacity
                key={pharm.id}
                style={styles.pharmCard}
                onPress={() => navigation.navigate('PharmacyDetailScreen', { pharmacy: pharm })}
              >
                {pharm.logo ? (
                  <Image source={pharm.logo} style={styles.pharmLogo} />
                ) : (
                  <View style={styles.pharmLogoPlaceholder}>
                    <Ionicons name="medical" size={30} color="#23238E" />
                  </View>
                )}
                <View style={styles.pharmContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.pharmName}>{pharm.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: (pharm.isOpen || pharm.openNow) ? '#E8F5E9' : '#FFEBEE' }]}>
                      <Text style={[styles.statusText, { color: (pharm.isOpen || pharm.openNow) ? '#4CAF50' : '#E53935' }]}>
                        {(pharm.isOpen || pharm.openNow) ? 'OPEN' : 'CLOSED'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pharmAddr} numberOfLines={1}>{pharm.address}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{pharm.rating} {pharm.reviews ? `(${pharm.reviews} reviews)` : ''}</Text>
                    </View>
                    <View style={styles.distanceBox}>
                      <Ionicons name="navigate-outline" size={14} color="#888" />
                      <Text style={styles.distanceText}>{pharm.distance || 'Near you'}</Text>
                    </View>
                  </View>

                  {pharm.is24Hours && (
                    <View style={styles.badge24}>
                      <Ionicons name="infinite" size={12} color="#4CAF50" />
                      <Text style={styles.badge24Text}>24/7 Open</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: scale(15) },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(2) },
  locationText: { fontSize: moderateScale(12), color: '#888', marginLeft: scale(4) },
  iconBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: { padding: wp(5) },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    paddingHorizontal: wp(4),
    height: verticalScale(52),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: { flex: 1, marginLeft: scale(10), fontSize: moderateScale(15), color: '#222' },
  filterScroll: { paddingLeft: wp(5), paddingBottom: hp(2) },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEE',
    marginRight: scale(10),
  },
  filterChipActive: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  filterText: { fontSize: moderateScale(13), color: '#666', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: wp(5),
    marginBottom: verticalScale(16),
  },
  pharmCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pharmLogo: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(16),
    backgroundColor: '#F5F7FA',
  },
  pharmLogoPlaceholder: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(16),
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmContent: {
    flex: 1,
    marginLeft: scale(15),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pharmName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  pharmAddr: {
    fontSize: moderateScale(13),
    color: '#888',
    marginTop: verticalScale(4),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    justifyContent: 'space-between',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#222',
    fontWeight: '600',
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  distanceText: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
    paddingHorizontal: wp(10),
    marginHorizontal: wp(5),
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    marginTop: verticalScale(10),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#666',
    marginTop: verticalScale(12),
  },
  emptySubtext: {
    fontSize: moderateScale(13),
    color: '#999',
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
  clearFilterBtn: {
    marginTop: verticalScale(16),
    backgroundColor: '#23238E',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: moderateScale(13),
  },
  badge24: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    marginTop: verticalScale(8),
    alignSelf: 'flex-start',
    gap: scale(4),
  },
  badge24Text: {
    fontSize: moderateScale(10),
    color: '#4CAF50',
    fontWeight: '600',
  },
});
