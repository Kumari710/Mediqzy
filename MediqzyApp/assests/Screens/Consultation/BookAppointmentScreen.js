import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

// Mock data for specialities - matching the category chips in screenshot
const categories = [
  { id: 1, name: 'General', icon: 'medical' },
  { id: 2, name: 'Dental', icon: 'skull' },
  { id: 3, name: 'ENT', icon: 'ear' },
  { id: 4, name: 'Heart Health', icon: 'heart' },
  { id: 5, name: 'Liver', icon: 'body' },
  { id: 6, name: 'Neurology', icon: 'pulse' },
];

const topDoctors = [
  {
    id: 1,
    name: 'Dr. Suresh Tanmani',
    specialty: 'General Physician',
    exp: '10 YEARS',
    regNo: 'TMC-98765',
    certification: 'MBBS, MD (Internal Medicine), AFIH',
    fee: 'Rs. 649',
    rating: '94%',
    location: 'Apollo Hospitals, Valechery',
    image: require('../../images/IndianDoctor.png'),
    hospitalLogo: require('../../images/apollo.png'),
    about: 'Dr. Suresh Tanmani is a highly experienced General Physician with over 10 years of clinical practice. He specializes in geriatric care, diabetes management, and preventive medicine. He is known for his patient-centric approach and thorough diagnosis. He has published over 15 papers in international medical journals and is a member of the IMA.'
  },
  {
    id: 2,
    name: 'Dr. Vijaya Kumar',
    specialty: 'General Physician',
    exp: '11 YEARS',
    regNo: 'KMC-45210',
    certification: 'MBBS, MD (Internal Medicine), Diabetology',
    fee: 'Rs. 750',
    rating: '96%',
    location: 'Fortis Malar, Adyar',
    image: require('../../images/IndianDoctor.png'),
    hospitalLogo: require('../../images/apollo.png'),
    about: 'Dr. Vijaya Kumar is an expert in chronic disease management with 11 years of experience. He has worked with prestigious institutions like Fortis and Apollo. His areas of expertise include hypertension monitoring and infectious diseases. He believes in minimal medication and holistic wellness.'
  },
  {
    id: 3,
    name: 'Dr. Swetha',
    specialty: 'Cardiologist',
    exp: '8 YEARS',
    regNo: 'TMC-77321',
    certification: 'MBBS, MD (Cardiology), DNB, FACC',
    fee: 'Rs. 899',
    rating: '98%',
    location: 'MGM Healthcare, Aminjikarai',
    image: require('../../images/IndianDoctor.png'),
    hospitalLogo: require('../../images/apollo.png'),
    about: 'Dr. Swetha is a renowned Cardiologist known for her expertise in interventional cardiology. With 8 years of experience, she has successfully performed over 500 angiograms and angioplasties. She is dedicated to advancing heart health through early detection and lifestyle modifications.'
  },
];

export default function BookAppointmentScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('online'); // 'online' or 'hospital'
  const [selectedCategory, setSelectedCategory] = useState('General');
  const userLocation = route?.params?.address || 'Rajaji Nagar';

  // Handle incoming tab/type parameters
  React.useEffect(() => {
    const initialTab = route?.params?.tab || route?.params?.type;
    if (initialTab === 'digital' || initialTab === 'online') {
      setActiveTab('online');
    } else if (initialTab === 'hospital') {
      setActiveTab('hospital');
    }
  }, [route?.params]);

  // Search and Category filtering logic
  const filteredDoctors = topDoctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchText.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchText.toLowerCase());

    // Category mapping
    let categoryFilter = selectedCategory;
    if (selectedCategory === 'Heart Health') categoryFilter = 'Cardiologist';

    const matchesCategory = selectedCategory === 'General'
      ? true
      : doctor.specialty.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const renderDoctorCard = (doctor) => (
    <TouchableOpacity
      key={doctor.id}
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorBookingScreen', { doctor, type: activeTab })}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <Image source={doctor.image} style={styles.doctorImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecText}>{doctor.specialty}</Text>
        </View>
        <View style={styles.hospitalLogoContainer}>
          <Image source={doctor.hospitalLogo} style={styles.hospitalLogoImage} />
        </View>
      </View>

      {/* Body Section */}
      <View style={styles.cardBody}>
        <View style={styles.metaRowContainer}>
          <View style={styles.metaLeft}>
            <Text style={styles.doctorExpText} numberOfLines={1}>
              {doctor.exp} • {doctor.certification}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={moderateScale(18)} color="#23238E" />
              <Text style={styles.locationTextBody}>{doctor.location}</Text>
            </View>
          </View>

          <View style={styles.ratingBadgeContainer}>
            <View style={styles.ratingBadgeContent}>
              <Ionicons name="thumbs-up" size={moderateScale(20)} color="#22C55E" />
              <Text style={styles.ratingPercentText}>{doctor.rating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Footer Section */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rs.</Text>
          <Text style={styles.priceValueText}>{doctor.fee.replace('Rs. ', '')}</Text>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('DoctorBookingScreen', { doctor, type: activeTab })}
        >
          <Text style={styles.actionBtnText}>
            {activeTab === 'online' ? 'Digital Consultation' : 'Hospital Visit'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" transparent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <TouchableOpacity style={styles.locationPill}>
            <Ionicons name="location" size={moderateScale(16)} color="#E60023" />
            <Text style={styles.locationText} numberOfLines={1}>
              {userLocation}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'online' && styles.activeTabItem]}
              onPress={() => setActiveTab('online')}
            >
              <Text style={[styles.tabText, activeTab === 'online' && styles.activeTabText]}>
                Online Consultation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'hospital' && styles.activeTabItem]}
              onPress={() => setActiveTab('hospital')}
            >
              <Text style={[styles.tabText, activeTab === 'hospital' && styles.activeTabText]}>
                Hospital Visit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={moderateScale(22)} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search For Doctor, Hospital..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
              <TouchableOpacity style={styles.filterBtn}>
                <Ionicons name="options-outline" size={moderateScale(22)} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories / Filters */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.name && styles.activeCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.name && styles.activeCategoryText,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Doctor List */}
          <View style={styles.doctorListSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Doctors</Text>
              <Text style={styles.resultsCount}>{filteredDoctors.length} results</Text>
            </View>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(renderDoctorCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={scale(50)} color="#ccc" />
                <Text style={styles.emptyText}>No doctors found matching "{searchText}"</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  iconBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginLeft: scale(12),
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: wp(35),
  },
  locationText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#23238E',
    marginLeft: scale(4),
  },
  tabContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(12),
    backgroundColor: '#fff',
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: scale(12),
    padding: scale(4),
  },
  tabItem: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(8),
  },
  activeTabItem: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#23238E',
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: wp(4),
    paddingTop: verticalScale(16),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(50),
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(15),
    color: '#1E293B',
    paddingVertical: 0,
  },
  filterBtn: {
    padding: scale(4),
    marginLeft: scale(8),
  },
  categoriesContainer: {
    marginTop: verticalScale(16),
  },
  categoriesScroll: {
    paddingHorizontal: wp(4),
    gap: scale(10),
  },
  categoryChip: {
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(8),
    borderRadius: scale(10),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#23238E',
  },
  activeCategoryChip: {
    backgroundColor: '#23238E',
  },
  categoryText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#23238E',
  },
  activeCategoryText: {
    color: '#fff',
  },
  doctorListSection: {
    paddingHorizontal: wp(4),
    marginTop: verticalScale(24),
    paddingBottom: hp(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: '#1E293B',
  },
  resultsCount: {
    fontSize: moderateScale(13),
    color: '#64748B',
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    backgroundColor: '#f1f3f6ff', // Light grey background for the top part
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  doctorImage: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(10),
  },
  headerInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#23238E',
  },
  doctorSpecText: {
    fontSize: moderateScale(13),
    color: '#64748B',
    marginTop: 1,
  },
  hospitalLogoContainer: {
    padding: scale(4),
    borderRadius: scale(8),
    width: scale(80), // Made wider (vitty) to show more text
    alignItems: 'flex-end',
  },
  hospitalLogoImage: {
    width: '100%',
    height: scale(24),
    resizeMode: 'contain',
  },
  cardBody: {
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(6),
  },
  metaRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: {
    flex: 1,
    marginRight: scale(8),
  },
  doctorExpText: {
    fontSize: moderateScale(12),
    color: '#64748B',
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  locationTextBody: {
    fontSize: moderateScale(12),
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  ratingBadgeContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: scale(8),
    backgroundColor: '#fff',
    padding: scale(2),
  },
  ratingBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },
  ratingPercentText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: scale(4),
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: scale(10),
    marginBottom: verticalScale(8),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(10),
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: -2,
  },
  priceValueText: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#1E293B',
  },
  actionBtn: {
    backgroundColor: '#231F8E',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    minWidth: wp(40),
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  promoBanner: {
    marginHorizontal: wp(4),
    marginBottom: hp(4),
    borderRadius: scale(20),
    overflow: 'hidden',
  },
  promoGradient: {
    padding: scale(20),
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#fff',
  },
  promoSubtitle: {
    fontSize: moderateScale(12),
    color: '#E0E7FF',
    marginTop: 4,
  },
  promoIconBox: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#94A3B8',
    marginTop: verticalScale(12),
    fontWeight: '500',
  },
});
