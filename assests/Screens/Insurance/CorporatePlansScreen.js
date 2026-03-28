import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  ScrollView, 
  TouchableOpacity, 
  Modal,
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

const plans = [
  {
    id: 1,
    title: 'Corporate Health Plus',
    members: 4,
    validTill: '23 Dec 2025',
    benefit: '₹2,500 Offset',
    icon: 'shield-checkmark',
    color: '#4F46E5',
    terms: ['Covers top 500+ hospitals', 'Free annual checkups', '24x7 priority support'],
  },
  {
    id: 2,
    title: 'Diagnostic Shield',
    members: 2,
    validTill: '15 Nov 2025',
    benefit: '80% Coverage',
    icon: 'flask',
    color: '#10B981',
    terms: ['Valid on all lab tests', 'Home collection included', 'Quick report access'],
  },
  {
    id: 3,
    title: 'Pharmacy Saver',
    members: 2,
    validTill: '10 Oct 2025',
    benefit: 'Flat 20% OFF',
    icon: 'bandage',
    color: '#EF4444',
    terms: ['Valid on all prescriptions', 'Free doorstep delivery', 'Monthly auto-refill'],
  },
];

export default function CorporatePlansScreen({ navigation }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showAppliedModal, setShowAppliedModal] = useState(false);
  const [appliedPlan, setAppliedPlan] = useState(null);

  const handleApply = (plan) => {
    setAppliedPlan(plan);
    setShowAppliedModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Corporate Plans</Text>
          <TouchableOpacity style={styles.helpBtn}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.introBox}>
            <Text style={styles.title}>Organization Benefits</Text>
            <Text style={styles.subtitle}>Unlock exclusive healthcare plans supported by your employer to save on consultations and more.</Text>
          </View>

          {/* Plan Cards */}
          {plans.map((plan, idx) => (
            <View key={plan.id} style={styles.planCard}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: `${plan.color}15` }]}>
                  <Ionicons name={plan.icon} size={28} color={plan.color} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{plan.members} Members</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{plan.validTill}</Text>
                  </View>
                </View>
                <View style={styles.benefitTag}>
                  <Text style={[styles.benefitText, { color: plan.color }]}>{plan.benefit}</Text>
                </View>
              </TouchableOpacity>

              {expandedIdx === idx && (
                <View style={styles.expandedArea}>
                  <View style={styles.divider} />
                  <Text style={styles.termsHeading}>Plan Highlights</Text>
                  {plan.terms.map((term, i) => (
                    <View key={i} style={styles.termRow}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.termText}>{term}</Text>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={[styles.applyBtn, { backgroundColor: COLORS.primary }]}
                    onPress={() => handleApply(plan)}
                  >
                    <Text style={styles.applyBtnText}>Claim Plan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          
          <View style={styles.supportBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.supportText}>Don't see your organization's plan? Please contact your HR department or our support team.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Success Modal */}
      <Modal
        visible={showAppliedModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[COLORS.success, '#34D399']}
              style={styles.modalIconBox}
            >
              <Ionicons name="checkmark" size={40} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.modalTitle}>Plan Applied!</Text>
            <Text style={styles.modalDesc}>
              The <Text style={styles.bold}>{appliedPlan?.title}</Text> has been successfully activated for your account.
            </Text>
            <TouchableOpacity 
               style={styles.doneBtn}
               onPress={() => {
                 setShowAppliedModal(false);
                 navigation.navigate('HomeScreen');
               }}
            >
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  helpBtn: {
    padding: scale(4),
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  introBox: {
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(2),
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(20),
  },
  planCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: wp(6),
    marginBottom: verticalScale(16),
    borderRadius: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
  },
  iconBox: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: scale(16),
  },
  planTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.border,
    marginHorizontal: scale(8),
  },
  benefitTag: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    backgroundColor: '#F1F5F9',
    borderRadius: scale(10),
  },
  benefitText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  expandedArea: {
    padding: scale(16),
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(15),
  },
  termsHeading: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(10),
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    gap: scale(10),
  },
  termText: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
  },
  applyBtn: {
    marginTop: verticalScale(15),
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  supportBox: {
    flexDirection: 'row',
    margin: wp(6),
    padding: scale(16),
    backgroundColor: '#EEF2FF',
    borderRadius: scale(16),
    gap: scale(12),
  },
  supportText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: COLORS.primary,
    lineHeight: moderateScale(18),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: scale(30),
    padding: scale(30),
    alignItems: 'center',
  },
  modalIconBox: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: verticalScale(10),
  },
  modalDesc: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(25),
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(30),
    borderRadius: scale(16),
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  bold: {
    fontWeight: '800',
    color: COLORS.text,
  },
});

