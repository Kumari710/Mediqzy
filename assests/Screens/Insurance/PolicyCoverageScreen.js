import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
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
  accent: '#EF4444',
  success: '#10B981',
  white: '#FFFFFF',
  background: '#F8F9FF',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

const allServices = [
  { title: 'Doctor Consultations', icon: 'medical' },
  { title: 'Lab Test Discounts', icon: 'flask' },
  { title: 'Pharmacy Benefits', icon: 'bandage' },
  { title: 'Annual Health Checkup', icon: 'calendar' },
  { title: 'Emergency Support', icon: 'alert-circle' },
];

const PolicyCoverageScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={styles.headerSection}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerBg}
        >
          <SafeAreaView edges={['top']}>
            {/* NAV BAR */}
            <View style={styles.navBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Policy Overview</Text>

              <TouchableOpacity style={styles.backBtn}>
                <Ionicons name="download-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* POLICY HERO */}
            <View style={styles.policyHero}>
              <View style={styles.policyBadge}>
                <Text style={styles.policyBadgeText}>CORPORATE GOLD</Text>
              </View>

              <Text style={styles.policyNumber}>Policy #MED-99283-X</Text>

              <View style={styles.balanceContainer}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>Remaining Balance</Text>
                  <Text style={styles.balanceValue}>
                    ₹2,20,000 <Text style={styles.totalValue}>/ ₹5L</Text>
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '56%' }]} />
                </View>

                <View style={styles.expiryRow}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.expiryText}>Expires in 324 days</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* POLICY HOLDER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy Holder</Text>

          <View style={styles.holderCard}>
            <Image source={require('../../images/doctor.png')} style={styles.holderAvatar} />

            <View style={styles.holderInfo}>
              <Text style={styles.holderName}>Deepa Anandan</Text>
              <Text style={styles.holderId}>EMP ID: EMP23456</Text>

              <View style={styles.hospitalRow}>
                <Ionicons name="location" size={14} color={COLORS.primary} />
                <Text style={styles.hospitalName}>Mayden Smart Health</Text>
              </View>
            </View>

            <View style={styles.activeTag}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* BENEFITS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Key Benefits</Text>
            <Text style={styles.seeAll}>Full Details</Text>
          </View>

          <View style={styles.benefitsGrid}>
            {allServices.slice(0, 4).map((item, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIconBox}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.benefitTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MEMBERS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members Covered (4)</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { name: 'Deepa (Self)', role: 'Primary', img: require('../../images/doctor.png') },
              { name: 'Anusha K', role: 'Spouse', img: require('../../images/2.png') },
              { name: 'Rahul A', role: 'Child', img: require('../../images/3.png') },
              { name: 'Sita M', role: 'Parent', img: require('../../images/Points1.png') },
            ].map((m, i) => (
              <View key={i} style={styles.memberCard}>
                <Image source={m.img} style={styles.memberAvatar} />
                <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: hp(5) }} />
      </ScrollView>
    </View>
  );
};

export default PolicyCoverageScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  headerSection: { height: hp(32) },
  headerBg: {
    flex: 1,
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    paddingHorizontal: wp(5),
  },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    fontWeight: '700',
  },

  policyHero: { marginTop: hp(2) },

  policyBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(6),
    alignSelf: 'flex-start',
  },

  policyBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  policyNumber: {
    color: COLORS.white,
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginVertical: hp(1),
  },

  balanceContainer: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: scale(20),
    padding: scale(16),
  },

  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  balanceValue: { color: COLORS.white, fontWeight: '700' },
  totalValue: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginVertical: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },

  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expiryText: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  scrollContent: { paddingTop: hp(2) },

  section: { paddingHorizontal: wp(5), marginBottom: hp(3) },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: hp(1) },

  holderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  holderAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  holderInfo: { flex: 1 },

  holderName: { fontWeight: '700', fontSize: 16 },
  holderId: { fontSize: 12, color: COLORS.textSecondary },

  hospitalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hospitalName: { fontSize: 12, color: COLORS.primary },

  activeTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  activeText: { fontSize: 10, fontWeight: '700', color: COLORS.success },

  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  benefitItem: {
    width: (width - wp(10) - 12) / 2,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },

  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  benefitTitle: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  memberCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },

  memberAvatar: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  memberName: { fontSize: 13, fontWeight: '700' },
  memberRole: { fontSize: 11, color: COLORS.textSecondary },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAll: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
});
