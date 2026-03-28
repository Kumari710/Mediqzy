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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getData } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  white: '#FFFFFF',
  background: '#F5F5F5',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  cardBg: '#FFFFFF',
};

// Steps for the horizontal stepper
const STEPS = [
  { key: 'given', label: 'Test\nGiven by\nPatient', icon: 'flask-outline' },
  { key: 'payment', label: 'Payment\nDone', icon: 'cash-outline' },
  { key: 'received', label: 'Sample\nReceived at\nLab', icon: 'time-outline' },
  { key: 'results', label: 'Test Results\nReceived', icon: 'document-text-outline' },
];

export default function LabTestDetailsScreen({ navigation, route }) {
  const { order: initialOrder, orderId } = route.params || {};
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);
  const [currentStep, setCurrentStep] = useState(1); // 0-indexed, 0 = Test Given

  useEffect(() => {
    if (orderId && !initialOrder) {
      fetchOrder(orderId);
    } else if (initialOrder) {
      setOrder(initialOrder);
      updateStep(initialOrder?.status);
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
          updateStep(result.data.status);
        }
      }
    } catch (error) {
      console.warn('Error fetching order:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStep = (status) => {
    const statusMap = {
      booked: 0,
      confirmed: 0,
      payment_done: 1,
      collected: 2,
      sample_collected: 2,
      sample_received: 2,
      processing: 2,
      completed: 3,
      results_ready: 3,
    };
    const s = (status || 'booked').toLowerCase();
    setCurrentStep(statusMap[s] ?? 0);
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleChat = () => {
    navigation.navigate('DoctorChatScreen', {
      type: 'support',
      title: 'Lab Support',
    });
  };

  const handleDownloadBill = () => {
    navigation.navigate('LabBillScreen', { order, orderId: order?.id || orderId });
  };

  const handleDownloadReport = () => {
    navigation.navigate('ViewLabReportScreen', { order });
  };

  const handleShareResults = () => {
    // Share functionality
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ActivityIndicator size="large" color={COLORS.primary} />
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
  const testName = order.items?.[0]?.name || order.tests?.[0]?.name || order.testName || 'PCR Test';
  const testNo = order.orderId || `RK${Date.now().toString().slice(-7)}`;
  const patientName = order.patientName || order.patient?.name || 'Shivakumar';
  const testDate = order.schedule?.date || order.testDate || '23.12.2023';
  const reportDate = order.reportDate || testDate;

  // Nurse/Agent info
  const nurse = {
    name: 'Ria Swami',
    role: 'Nurse',
    rating: 5,
    image: require('../../images/doctor.png'),
    phone: '+919876543210',
  };

  // Get status message
  const getStatusMessage = () => {
    switch (currentStep) {
      case 0:
        return { text: 'Sample Collected', color: COLORS.success };
      case 1:
        return { text: 'Payment Done', color: COLORS.success };
      case 2:
        return { text: 'Sample Received', color: COLORS.success };
      case 3:
        return { text: 'Results Ready', color: COLORS.success };
      default:
        return { text: 'Processing', color: COLORS.primary };
    }
  };

  const statusMsg = getStatusMessage();

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#1A1A2E' : '#ccc'}
          style={{ marginRight: 1 }}
        />
      );
    }
    return stars;
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
          <Text style={styles.headerTitle}>Lab Test Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Test Info Card */}
          <View style={styles.testInfoCard}>
            <View style={styles.testInfoHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.testName}>{testName}</Text>
                <Text style={styles.testNo}>Test No. - {testNo}</Text>
              </View>
              <Image
                source={require('../../images/apollo.png')}
                style={styles.apolloLogo}
                resizeMode="contain"
              />
            </View>

            {/* Patient Details Row */}
            <View style={styles.patientDetailsRow}>
              <View style={styles.patientDetailItem}>
                <Text style={styles.detailLabel}>Patient name</Text>
                <Text style={styles.detailValue}>{patientName}</Text>
              </View>
              <View style={styles.patientDetailItem}>
                <Text style={styles.detailLabel}>Test Date</Text>
                <Text style={styles.detailValue}>{testDate}</Text>
              </View>
              <View style={styles.patientDetailItem}>
                <Text style={styles.detailLabel}>Report Date</Text>
                <Text style={styles.detailValue}>{reportDate}</Text>
              </View>
            </View>

            {/* Horizontal Stepper */}
            <View style={styles.stepperContainer}>
              {STEPS.map((step, index) => (
                <React.Fragment key={step.key}>
                  <TouchableOpacity 
                    style={styles.stepItem}
                    onPress={() => setCurrentStep(index)}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        index <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive,
                      ]}
                    >
                      {index <= currentStep ? (
                        <Ionicons
                          name={index === 0 ? 'flask' : index === 1 ? 'cash' : index === 2 ? 'time' : 'document-text'}
                          size={18}
                          color={COLORS.white}
                        />
                      ) : (
                        <Ionicons
                          name={index === 0 ? 'flask-outline' : index === 1 ? 'cash-outline' : index === 2 ? 'time-outline' : 'document-text-outline'}
                          size={18}
                          color={COLORS.textSecondary}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        index <= currentStep ? styles.stepLabelActive : styles.stepLabelInactive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </TouchableOpacity>
                  {index < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        index < currentStep ? styles.stepLineActive : styles.stepLineInactive,
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Content Card - Changes based on status */}
          <View style={styles.contentCard}>
            {currentStep === 0 ? (
              // Sample Collected - Show Nurse Info
              <>
                <View style={styles.nurseCard}>
                  <Image source={nurse.image} style={styles.nurseImage} />
                  <View style={styles.nurseInfo}>
                    <Text style={styles.nurseName}>{nurse.name}</Text>
                    <Text style={styles.nurseRole}>{nurse.role}</Text>
                    <View style={styles.starsRow}>{renderStars(nurse.rating)}</View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
                      <Ionicons name="chatbubble-outline" size={20} color={COLORS.success} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                      <Ionicons name="call-outline" size={20} color={COLORS.success} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sample Tubes Image */}
                <View style={styles.sampleImageContainer}>
                  <Image
                    source={require('../../images/sample.png')}
                    style={styles.sampleImage}
                    resizeMode="contain"
                  />
                </View>
              </>
            ) : currentStep < 3 ? (
              // Payment Done / Sample Received - Show No Reports
              <View style={styles.noReportsContainer}>
                <Text style={styles.noReportsTitle}>No Reports</Text>
                <Text style={styles.noReportsText}>
                  Your report is yet to be{'\n'}generated by the lab
                </Text>
              </View>
            ) : (
              // Results Ready - Show Download Report
              <View style={styles.downloadReportContainer}>
                <Text style={styles.downloadReportTitle}>Download  Report</Text>
                <View style={styles.pdfIconContainer}>
                  <Ionicons name="document-text" size={50} color="#E53935" />
                  <Text style={styles.pdfText}>PDF</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReport}>
                  <Text style={styles.downloadBtnText}>Download</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Status Message */}
          <View style={styles.statusMessageContainer}>
            <Ionicons name="checkmark-circle-outline" size={28} color={statusMsg.color} />
            <Text style={[styles.statusMessageText, { color: statusMsg.color }]}>
              {statusMsg.text}
            </Text>
          </View>

          {/* Share Results Button (only for completed) */}
          {currentStep >= 3 && (
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareResults}>
              <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
              <Text style={styles.shareBtnText}>Share Results</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.downloadBillBtn} onPress={handleDownloadBill}>
            <Ionicons name="download-outline" size={20} color={COLORS.white} />
            <Text style={styles.downloadBillBtnText}>Download Bill</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    backgroundColor: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(12),
  },
  testInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginTop: hp(2),
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  testInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testName: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.primary,
  },
  testNo: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  apolloLogo: {
    width: 50,
    height: 50,
  },
  patientDetailsRow: {
    flexDirection: 'row',
    marginTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: hp(1.5),
  },
  patientDetailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.text,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: hp(2.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stepItem: {
    alignItems: 'center',
    width: wp(16),
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.success,
  },
  stepCircleInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepLabel: {
    fontSize: moderateScale(9),
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 12,
  },
  stepLabelActive: {
    color: COLORS.success,
    fontWeight: '600',
  },
  stepLabelInactive: {
    color: COLORS.textSecondary,
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginTop: 17,
    marginHorizontal: -5,
  },
  stepLineActive: {
    backgroundColor: COLORS.success,
  },
  stepLineInactive: {
    backgroundColor: COLORS.border,
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: wp(4),
    marginTop: hp(2),
    minHeight: hp(25),
  },
  nurseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nurseImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  nurseInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  nurseName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: COLORS.text,
  },
  nurseRole: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  sampleImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  sampleImage: {
    width: wp(50),
    height: hp(15),
  },
  noReportsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(5),
  },
  noReportsTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: hp(1),
  },
  noReportsText: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  downloadReportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  downloadReportTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(2),
  },
  pdfIcon: {
    width: 80,
    height: 80,
    marginBottom: hp(2),
  },
  pdfIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  pdfText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#E53935',
    marginTop: 4,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(15),
    paddingVertical: hp(1.5),
    borderRadius: 10,
  },
  downloadBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    gap: 8,
  },
  statusMessageText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginTop: hp(2),
    paddingVertical: hp(1.8),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  shareBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingBottom: hp(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  downloadBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: 10,
    gap: 8,
  },
  downloadBillBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});
