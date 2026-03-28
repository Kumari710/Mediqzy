import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

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

const defaultTest = {
  name: 'AHbA1c Test (Hemoglobin A1c)',
  price: 612,
  oldPrice: 1134,
  testsIncluded: 3,
  lab: 'Apollo Diagnostics',
  address: 'T.Nagar, Chennai 600017',
  slot: '08:00 AM, Tomorrow',
  about: 'The HbA1c test measures the amount of blood sugar (glucose) attached to hemoglobin. Hemoglobin is the part of your red blood cells that carries oxygen from your lungs to the rest of your body.',
  included: ['HBA1C, GLYCATED HEMOGLOBIN', 'ESTIMATED AVERAGE GLUCOSE (eAG)', 'FASTING BLOOD SUGAR (Optional)'],
};

export default function TestDetailsScreen({ navigation, route }) {
  const { testData } = route.params || {};
  const test = testData || defaultTest;

  const handleAdd = async () => {
    const { addToLabCart } = require('../../Utils/firebaseLabStorage');
    const res = await addToLabCart(test);
    if (res.success) {
      Alert.alert('Added to Cart', `${test.name} is ready for scheduling.`, [
        { text: 'View Cart', onPress: () => navigation.navigate('LabCartScreen') },
        { text: 'Continue' }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Details</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('LabCartScreen')}>
          <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Test Card Hero */}
        <View style={styles.heroCard}>
          <View style={styles.labSnippet}>
            <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
            <View style={styles.labInfo}>
              <Text style={styles.labName}>{test.lab}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={COLORS.accent} />
                <Text style={styles.ratingText}>4.8 • Top Rated Lab</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.testHeader}>
            <Text style={styles.testName}>{test.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{test.price}</Text>
              {test.oldPrice && <Text style={styles.oldPrice}>₹{test.oldPrice}</Text>}
            </View>
          </View>

          <View style={styles.metaGrid}>
            <MetaItem icon="calendar" label="Next Slot" value={test.slot} />
            <MetaItem icon="time" label="Report Time" value="Within 24 Hours" />
            <MetaItem icon="water" label="Sample" value="Blood" />
            <MetaItem icon="shield-checkmark" label="Prep" value="No Prep Required" />
          </View>
        </View>

        {/* Support Banner */}
        <TouchableOpacity style={styles.supportBanner}>
          <View style={styles.supportIconBox}>
            <Ionicons name="headset" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Need Expert Advice?</Text>
            <Text style={styles.supportDesc}>Talk to our lab specialists now.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
        </TouchableOpacity>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Test</Text>
          <Text style={styles.aboutText}>{test.about}</Text>
        </View>

        {/* Parameters Included */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parameters Included</Text>
            <View style={[styles.badge, { backgroundColor: COLORS.background }]}>
              <Text style={styles.badgeText}>{test.testsIncluded} Total</Text>
            </View>
          </View>
          <View style={styles.parameterCard}>
            {test.included.map((item, idx) => (
              <View key={idx} style={styles.parameterRow}>
                <View style={styles.paramBullet} />
                <Text style={styles.parameterText}>{item}</Text>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.border} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: hp(12) }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleAdd}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryBtnText}>Add to Cart • ₹{test.price}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const MetaItem = ({ icon, label, value }) => (
  <View style={styles.metaItem}>
    <Ionicons name={icon} size={16} color={COLORS.primary} style={styles.metaIcon} />
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  cartBtn: { padding: 5 },
  scrollContent: { paddingTop: hp(2) },
  heroCard: {
    marginHorizontal: wp(5),
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  labSnippet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labLogo: { width: 44, height: 44, borderRadius: 10 },
  labName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 15 },
  testHeader: { marginBottom: 20 },
  testName: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  oldPrice: { fontSize: 16, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 5 },
  metaItem: { width: '45%', flexDirection: 'row', gap: 10, alignItems: 'center' },
  metaIcon: { backgroundColor: '#EEF2FF', padding: 8, borderRadius: 10 },
  metaLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  supportBanner: {
    marginHorizontal: wp(5),
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  supportIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  supportInfo: { flex: 1 },
  supportTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  supportDesc: { fontSize: 12, color: COLORS.secondary },
  section: { paddingHorizontal: wp(5), marginBottom: hp(3) },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  aboutText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  parameterCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  parameterRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  paramBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary },
  parameterText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: wp(5),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryBtn: { borderRadius: 16, overflow: 'hidden' },
  gradientBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
