import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp, screenWidth } from '../../Utils/responsive';



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

const defaultLab = {
  name: 'Apollo Diagnostics',
  address: 'Anna Nagar, Chennai',
  fullAddress: '#567, New Lake Road, T Nagar, Chennai - 600091',
  rating: 4.8,
  reviews: '1.2k',
  img: require('../../images/apollo.png'),
};

// Lab tests with category tags for filtering
const labTests = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 450, originalPrice: 900, includes: 18, quick: true, category: 'Blood Test' },
  { id: 2, name: 'Diabetes Profile (HBA1C)', price: 612, originalPrice: 1200, includes: 3, quick: true, category: 'Blood Test' },
  { id: 3, name: 'Thyroid Profile (T3 T4 TSH)', price: 799, originalPrice: 1500, includes: 3, quick: false, category: 'Blood Test' },
  { id: 4, name: 'Lipid Profile', price: 850, originalPrice: 1600, includes: 7, quick: true, category: 'Blood Test' },
  { id: 5, name: 'CT Scan - Head', price: 3500, originalPrice: 5500, includes: 1, quick: false, category: 'Scans' },
  { id: 6, name: 'MRI Brain', price: 6500, originalPrice: 9000, includes: 1, quick: false, category: 'Scans' },
  { id: 7, name: 'X-Ray Chest', price: 450, originalPrice: 700, includes: 1, quick: true, category: 'Scans' },
  { id: 8, name: 'Ultrasound Abdomen', price: 1200, originalPrice: 2000, includes: 1, quick: true, category: 'Scans' },
  { id: 9, name: 'Full Body Checkup Basic', price: 1999, originalPrice: 4500, includes: 65, quick: false, category: 'Full Body Checkup' },
  { id: 10, name: 'Full Body Checkup Premium', price: 3999, originalPrice: 8000, includes: 90, quick: false, category: 'Full Body Checkup' },
  { id: 11, name: 'Executive Health Checkup', price: 5999, originalPrice: 12000, includes: 110, quick: false, category: 'Full Body Checkup' },
];

// Filter categories
const categories = ['All', 'Blood Test', 'Scans', 'Full Body Checkup'];

export default function LabDetailsScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { lab } = route.params || {};
  const labData = lab || defaultLab;

  // Filter tests based on selected category
  const filteredTests = useMemo(() => {
    if (selectedCategory === 'All') {
      return labTests;
    }
    return labTests.filter(test => test.category === selectedCategory);
  }, [selectedCategory]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Image Header */}
        <View style={styles.headerCover}>
          <Image source={require('../../images/Map.png')} style={styles.coverImg} />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverOverlay}
          />
          <SafeAreaView style={styles.headerNav} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="share-social-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.labMainInfo}>
            <TouchableOpacity style={styles.labMainTop} onPress={() => navigation.navigate('LabDetailsInfoScreen', { lab: labData })}>
              <Image source={labData.img || defaultLab.img} style={styles.labThumb} />
              <View style={styles.labTitleBox}>
                <View style={styles.titleRow}>
                  <Text style={styles.labName}>{labData.name}</Text>
                  <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.labLoc}>{labData.location || labData.address}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.labStats}>
              <StatItem label="Rating" value={`${labData.rating || 4.8} ⭐`} />
              <View style={styles.statDivider} />
              <StatItem label="Tests" value="500+" />
              <View style={styles.statDivider} />
              <StatItem label="Time" value="24/7" />
            </View>
          </View>
        </View>

        {/* Categories / Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Tests ({filteredTests.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tests List */}
        <View style={styles.testsGrid}>
          {filteredTests.map((test) => (

            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => navigation.navigate('TestDetailsScreen', { testData: test })}
            >
              <View style={styles.testTop}>
                <Text style={styles.testName} numberOfLines={2}>{test.name}</Text>
                {test.quick && (
                  <View style={styles.quickBadge}>
                    <Ionicons name="flash" size={10} color={COLORS.accent} />
                    <Text style={styles.quickText}>FAST</Text>
                  </View>
                )}
              </View>
              <Text style={styles.testSub}>{test.includes} Parameters Included</Text>
              <View style={styles.testBottom}>
                <View>
                  <Text style={styles.testPrice}>₹{test.price}</Text>
                  <Text style={styles.originalPrice}>₹{test.originalPrice}</Text>
                </View>
                <TouchableOpacity style={styles.addBtnSmall}>
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lab Info / Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lab Information</Text>
          <View style={styles.infoBox}>
            <InfoRow icon="location" label="Address" value={labData.fullAddress || defaultLab.fullAddress} />
            <InfoRow icon="call" label="Contact" value="+91 98765 43210" />
            <InfoRow icon="globe" label="Website" value="www.apollodiagnostics.com" last />
          </View>
        </View>

        <View style={{ height: hp(5) }} />
      </ScrollView>
    </View>
  );
}

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
    <View style={styles.infoIconBox}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: hp(5) },
  headerCover: { height: hp(40), width: '100%', marginBottom: hp(10) },
  coverImg: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject },
  headerNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  headerBtn: { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  labMainInfo: {
    position: 'absolute',
    bottom: -hp(8),
    left: wp(5),
    right: wp(5),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  labMainTop: { flexDirection: 'row', gap: scale(15), marginBottom: verticalScale(15) },
  labThumb: { width: scale(60), height: scale(60), borderRadius: moderateScale(14) },
  labTitleBox: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labName: { fontSize: moderateScale(18), fontWeight: '900', color: COLORS.text },
  labLoc: { fontSize: moderateScale(13), color: COLORS.textSecondary, fontWeight: '500' },
  labStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: verticalScale(15) },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: moderateScale(15), fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: moderateScale(11), color: COLORS.textSecondary, marginTop: verticalScale(2) },
  statDivider: { width: 1, height: verticalScale(25), backgroundColor: COLORS.border, alignSelf: 'center' },
  section: { paddingHorizontal: wp(5), marginTop: verticalScale(25) },
  sectionTitle: { fontSize: moderateScale(18), fontWeight: '800', color: COLORS.text, marginBottom: verticalScale(15) },
  catRow: { gap: scale(10) },
  catChip: { paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.textSecondary },
  catTextActive: { color: COLORS.white },
  testsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(4), marginTop: verticalScale(15), justifyContent: 'space-between' },
  testCard: {
    width: (screenWidth - wp(12)) / 2,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(15),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  testTop: { marginBottom: verticalScale(10), height: verticalScale(60) },
  testName: { fontSize: moderateScale(14), fontWeight: '800', color: COLORS.text, lineHeight: moderateScale(18) },
  quickBadge: { flexDirection: 'row', alignItems: 'center', gap: scale(4), backgroundColor: '#FEF3C7', paddingHorizontal: scale(6), paddingVertical: verticalScale(2), borderRadius: moderateScale(4), alignSelf: 'flex-start', marginTop: verticalScale(5) },
  quickText: { fontSize: moderateScale(8), fontWeight: '900', color: '#B45309' },
  testSub: { fontSize: moderateScale(11), color: COLORS.textSecondary, marginBottom: verticalScale(12) },
  testBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  testPrice: { fontSize: moderateScale(16), fontWeight: '900', color: COLORS.primary },
  originalPrice: { fontSize: moderateScale(11), color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  addBtnSmall: { width: scale(32), height: scale(32), borderRadius: moderateScale(10), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  infoBox: { backgroundColor: COLORS.white, borderRadius: moderateScale(20), padding: moderateScale(10), borderWidth: 1, borderColor: COLORS.border },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(12), borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: scale(12) },
  infoIconBox: { width: scale(36), height: scale(36), borderRadius: moderateScale(10), backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: moderateScale(10), fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase' },
  infoValue: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.text, marginTop: verticalScale(2) },
});
