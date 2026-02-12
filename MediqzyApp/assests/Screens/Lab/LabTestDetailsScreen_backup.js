import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getOrderById, getData } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  successLight: '#D1FAE5',
  warningLight: '#FEF3C7',
  primaryLight: '#E0E7FF',
};

const statusSteps = [
  { key: 'booked', label: 'Booked', icon: 'checkmark-circle' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-done-circle' },
  { key: 'on_the_way', label: 'On the Way', icon: 'bicycle' },
  { key: 'collected', label: 'Collected', icon: 'flask' },
  { key: 'completed', label: 'Completed', icon: 'document-text' },
];

export default function LabTestDetailsScreen({ navigation, route }) {
  const { order: initialOrder, orderId } = route.params || {};
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (orderId && !initialOrder) {
      fetchOrder(orderId);
    } else if (initialOrder) {
      setOrder(initialOrder);
      updateStatusIndex(initialOrder?.status);
    }
  }, [orderId, initialOrder]);

  const fetchOrder = async (id) => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        const result = await getData(`labOrders/${user.uid}/${id}`);
        if (result.success && result.data) {
          setOrder({ id, ...result.data });
          updateStatusIndex(result.data.status);
        } else {
          // Try fetching from allOrders
          const allOrdersResult = await getOrderById(id);
          if (allOrdersResult.success) {
            setOrder(allOrdersResult.data);
            updateStatusIndex(allOrdersResult.data.status);
          }
        }
      }
    } catch (error) {
      console.warn('Error fetching order:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusIndex = (status) => {
    const statusMap = {
      booked: 0,
      scheduled: 0,
      confirmed: 1,
      assigned: 1,
      on_the_way: 2,
      in_progress: 2,
      arrived: 2,
      collected: 3,
      sample_collected: 3,
      processing: 3,
      completed: 4,
      delivered: 4,
    };
    const s = (status || 'booked').toLowerCase();
    setCurrentStepIndex(statusMap[s] ?? 0);
  };

  const handleTrackCollection = () => {
    navigation.navigate('CollectionStatusScreen', { order, orderId: order?.id || orderId });
  };

  const handleViewBill = () => {
    navigation.navigate('LabBillScreen', { order, orderId: order?.id || orderId });
  };

  const handleContactSupport = () => {
    navigation.navigate('DoctorChatScreen', {
      type: 'support',
      title: 'Lab Support',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textSecondary} />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Normalize order data
  const testName = order.items?.[0]?.name || order.tests?.[0]?.name || order.testName || 'Lab Test';
  const labName = order.provider?.name || order.labName || 'Apollo Diagnostics';
  const labAddress = order.provider?.address || order.labAddress || order.address?.address || 'T.Nagar, Chennai';
  const patientName = order.patientName || order.patient?.name || 'Patient';
  const testDate = order.schedule?.date || order.testDate || order.date || new Date().toLocaleDateString('en-GB');
  const timeSlot = order.schedule?.timeSlot || order.timeSlot || '08:00 AM - 10:00 AM';
  const orderIdDisplay = order.orderId || order.id?.slice(-8).toUpperCase() || 'LAB-XXXXX';
  const status = (order.status || 'booked').toUpperCase().replace('_', ' ');

  const agentInfo = order.agent || {
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    photo: null,
    rating: 4.8,
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <TouchableOpacity style={styles.helpBtn} onPress={handleContactSupport}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Banner */}
          <LinearGradient
            colors={currentStepIndex >= 4 ? [COLORS.success, '#059669'] : [COLORS.primary, COLORS.secondary]}
            style={styles.statusBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statusIcon}>
              <Ionicons
                name={currentStepIndex >= 4 ? 'checkmark-done-circle' : 'flask'}
                size={28}
                color={COLORS.white}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Order Status</Text>
              <Text style={styles.statusValue}>{status}</Text>
            </View>
            <View style={styles.orderIdBox}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>{orderIdDisplay}</Text>
            </View>
          </LinearGradient>

          {/* Progress Stepper */}
          <View style={styles.stepperCard}>
            <Text style={styles.stepperTitle}>Order Progress</Text>
            <View style={styles.stepperTrack}>
              {statusSteps.map((step, index) => (
                <View key={step.key} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      index <= currentStepIndex && styles.stepDotActive,
                      index < currentStepIndex && styles.stepDotComplete,
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={14}
                      color={index <= currentStepIndex ? COLORS.white : COLORS.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      index <= currentStepIndex && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        index < currentStepIndex && styles.stepLineActive,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Appointment Summary */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Appointment Summary</Text>

            <View style={styles.labHeader}>
              <Image source={require('../../images/apollo.png')} style={styles.labLogo} />
              <View style={styles.labInfo}>
                <Text style={styles.labName}>{labName}</Text>
                <View style={styles.labLocation}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.labAddress}>{labAddress}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="flask-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Test Name</Text>
                <Text style={styles.detailValue}>{testName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Patient</Text>
                <Text style={styles.detailValue}>{patientName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Collection Date</Text>
                <Text style={styles.detailValue}>{testDate}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Time Slot</Text>
                <Text style={styles.detailValue}>{timeSlot}</Text>
              </View>
            </View>
          </View>

          {/* Assigned Professional */}
          {currentStepIndex >= 1 && currentStepIndex < 4 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Assigned Professional</Text>
              <View style={styles.agentCard}>
                <View style={styles.agentAvatar}>
                  {agentInfo.photo ? (
                    <Image source={{ uri: agentInfo.photo }} style={styles.agentPhoto} />
                  ) : (
                    <View style={styles.agentInitials}>
                      <Text style={styles.agentInitialsText}>
                        {agentInfo.name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{agentInfo.name}</Text>
                  <View style={styles.agentRating}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.agentRatingText}>{agentInfo.rating} Rating</Text>
                  </View>
                </View>
                <View style={styles.agentActions}>
                  <TouchableOpacity style={styles.agentActionBtn}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.agentActionBtn}>
                    <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Instructions for Sample Collection</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.instructionText}>
                  Please keep a valid ID proof ready for verification
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.instructionText}>
                  Fast for 10-12 hours before the test if required
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.instructionText}>
                  Drink plenty of water unless fasting is required
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.instructionText}>
                  Inform the phlebotomist about any medications
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: hp(15) }} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          {currentStepIndex < 3 ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackCollection}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="navigate-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Track Sample Collection</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : currentStepIndex === 3 ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackCollection}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flask" size={20} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Processing in Lab</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedActions}>
              <TouchableOpacity
                style={styles.viewReportBtn}
                onPress={() => navigation.navigate('ViewLabReportScreen', { order })}
              >
                <Ionicons name="document-text" size={20} color={COLORS.white} />
                <Text style={styles.viewReportBtnText}>View Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleViewBill}>
                <Ionicons name="download-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: verticalScale(15), color: COLORS.textSecondary, fontSize: moderateScale(14) },
  errorText: { marginTop: verticalScale(15), color: COLORS.text, fontSize: moderateScale(16), fontWeight: '600' },
  retryBtn: {
    marginTop: verticalScale(20),
    backgroundColor: COLORS.primary,
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
  },
  retryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(14) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '800', color: COLORS.text },
  helpBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingBottom: hp(5) },
  statusBanner: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: { flex: 1, marginLeft: scale(15) },
  statusLabel: { color: 'rgba(255,255,255,0.7)', fontSize: moderateScale(12), fontWeight: '500' },
  statusValue: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '800', marginTop: verticalScale(2) },
  orderIdBox: { alignItems: 'flex-end' },
  orderIdLabel: { color: 'rgba(255,255,255,0.7)', fontSize: moderateScale(10) },
  orderIdValue: { color: COLORS.white, fontSize: moderateScale(12), fontWeight: '700', marginTop: verticalScale(2) },
  stepperCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
  },
  stepperTitle: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(20) },
  stepperTrack: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepDotComplete: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  stepLabel: {
    fontSize: moderateScale(9),
    color: COLORS.textSecondary,
    marginTop: verticalScale(8),
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  stepLine: {
    position: 'absolute',
    top: scale(13),
    left: '55%',
    right: '-45%',
    height: 2,
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  stepLineActive: { backgroundColor: COLORS.success },
  sectionCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
  },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(15) },
  labHeader: { flexDirection: 'row', alignItems: 'center' },
  labLogo: { width: scale(50), height: scale(50), borderRadius: moderateScale(12) },
  labInfo: { flex: 1, marginLeft: scale(12) },
  labName: { fontSize: moderateScale(16), fontWeight: '700', color: COLORS.text },
  labLocation: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(4), gap: scale(4) },
  labAddress: { fontSize: moderateScale(12), color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: verticalScale(15) },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(15) },
  detailIconBox: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: moderateScale(11), color: COLORS.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: moderateScale(14), color: COLORS.text, fontWeight: '600', marginTop: verticalScale(2) },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: moderateScale(15),
    borderRadius: moderateScale(16),
  },
  agentAvatar: { marginRight: scale(12) },
  agentPhoto: { width: scale(50), height: scale(50), borderRadius: scale(25) },
  agentInitials: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitialsText: { fontSize: moderateScale(18), fontWeight: '700', color: COLORS.primary },
  agentInfo: { flex: 1 },
  agentName: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text },
  agentRating: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(4), gap: scale(4) },
  agentRatingText: { fontSize: moderateScale(12), color: COLORS.textSecondary },
  agentActions: { flexDirection: 'row', gap: scale(8) },
  agentActionBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsList: { gap: verticalScale(12) },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start' },
  bulletPoint: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: COLORS.primary,
    marginTop: verticalScale(6),
    marginRight: scale(10),
  },
  instructionText: { flex: 1, fontSize: moderateScale(13), color: COLORS.textSecondary, lineHeight: moderateScale(20) },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryBtn: { borderRadius: moderateScale(16), overflow: 'hidden' },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    gap: scale(10),
  },
  primaryBtnText: { color: COLORS.white, fontSize: moderateScale(16), fontWeight: '700' },
  completedActions: { flexDirection: 'row', gap: scale(12) },
  viewReportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    gap: scale(8),
  },
  viewReportBtnText: { color: COLORS.white, fontSize: moderateScale(15), fontWeight: '700' },
  downloadBtn: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
