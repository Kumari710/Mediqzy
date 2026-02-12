import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  accent: '#FFB800',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

const DEFAULT_PHARMACY = {
  name: 'Apollo Pharmacy',
  address: 'Anna Nagar, Chennai',
  fullAddress: '#567, New Lake Road, T Nagar, Chennai - 600091',
  rating: 4.8,
  reviews: 1240,
  logo: require('../../images/apollo.png'),
};

const PHARMACY_PRODUCTS = [
  { id: 1, name: 'Panadol', desc: '20pcs', price: 200, imageName: 'drug1.png' },
  { id: 2, name: 'Bodrex Herbal', desc: '100ml', price: 120, imageName: 'drug2.png' },
  { id: 3, name: 'OBH Combi', desc: '75ml', price: 70, imageName: 'drug1.png' },
  { id: 4, name: 'Oskadon SP', desc: '10pcs', price: 50, imageName: 'drug2.png' },
];

export default function PharmacyDetailScreen({ navigation, route }) {
  const { pharmacy } = route.params || {};
  const data = pharmacy || DEFAULT_PHARMACY;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pharmacy Profile</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={moderateScale(22)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Pharmacy Info Card */}
          <View style={styles.heroSection}>
            <View style={styles.pharmacyCard}>
              <View style={styles.pharmHeader}>
                <Image source={data.logo || DEFAULT_PHARMACY.logo} style={styles.logo} />
                <View style={styles.pharmText}>
                  <Text style={styles.pharmName}>{data.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={moderateScale(14)} color={COLORS.accent} />
                    <Text style={styles.ratingText}>{data.rating || 4.8}</Text>
                    <Text style={styles.reviewText}>({data.reviews || 120} Reviews)</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>OPEN</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={moderateScale(18)} color={COLORS.primary} />
                  <Text style={styles.infoValue}>{data.address || data.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={moderateScale(18)} color={COLORS.primary} />
                  <Text style={styles.infoValue}>09:00 AM - 10:00 PM</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={moderateScale(18)} color={COLORS.white} />
                <Text style={styles.callText}>Call Pharmacy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Products Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Medicines</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Filters</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {PHARMACY_PRODUCTS.map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.prodCard}
                onPress={() => navigation.navigate('DrugDetailsScreen', { product: prod })}
              >
                <View style={styles.prodImageContainer}>
                  <Image
                    source={prod.imageName === 'drug2.png' ? require('../../images/drug2.png') : require('../../images/drug1.png')}
                    style={styles.prodImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.prodInfo}>
                  <Text style={styles.prodName} numberOfLines={1}>{prod.name}</Text>
                  <Text style={styles.prodDesc}>{prod.desc}</Text>
                  <View style={styles.prodFooter}>
                    <Text style={styles.prodPrice}>Rs. {prod.price}</Text>
                    <View style={styles.addIcon}>
                      <Ionicons name="add" size={moderateScale(18)} color={COLORS.white} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: scale(4) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222' },
  shareBtn: { padding: scale(4) },
  scrollContent: { paddingBottom: hp(5) },
  heroSection: { paddingHorizontal: wp(5), marginTop: verticalScale(20) },
  pharmacyCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
  },
  pharmHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(15) },
  logo: { width: scale(64), height: scale(64), borderRadius: moderateScale(16) },
  pharmText: { flex: 1 },
  pharmName: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: scale(5), marginTop: verticalScale(4) },
  ratingText: { fontSize: moderateScale(14), fontWeight: '600', color: '#222' },
  reviewText: { fontSize: moderateScale(12), color: '#888' },
  statusBadge: { paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6) },
  statusText: { fontSize: moderateScale(10), fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: verticalScale(15) },
  contactInfo: { gap: verticalScale(10) },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  infoValue: { fontSize: moderateScale(14), color: '#555', fontWeight: '500' },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(20),
    gap: scale(10),
  },
  callText: { color: COLORS.white, fontSize: moderateScale(15), fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(5), marginTop: verticalScale(30), marginBottom: verticalScale(15) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222' },
  filterText: { fontSize: moderateScale(13), color: COLORS.primary, fontWeight: '600' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), justifyContent: 'space-between' },
  prodCard: {
    width: (width - wp(12)) / 2,
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  prodImageContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: moderateScale(16),
    height: verticalScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    
  },
  prodImg: { width: '80%', height: '80%' },
  prodInfo: { gap: verticalScale(2) },
  prodName: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#222' },
  prodDesc: { fontSize: moderateScale(11), color: '#888' },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: verticalScale(8) },
  prodPrice: { fontSize: moderateScale(15), fontWeight: 'bold', color: COLORS.primary },
  addIcon: { backgroundColor: COLORS.primary, borderRadius: moderateScale(8), width: scale(28), height: scale(28), justifyContent: 'center', alignItems: 'center' },
});
