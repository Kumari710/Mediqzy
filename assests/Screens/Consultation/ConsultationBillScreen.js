import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Share,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function ConsultationBillScreen({ navigation, route }) {
  const [showModal, setShowModal] = useState(false);

  const appointment = route?.params?.appointment || {
    doctor: 'Dr. Suresh Tanmani',
    specialty: 'General Physician',
    patientName: 'Shivakumar',
    consultationNo: 'RK9755472',
    date: '21.05.25',
    time: '11:00 AM',
    type: 'online',
    fee: 300,
    bookingFee: 40,
    totalAmount: 340,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  };

  const consultationFee = appointment.fee || 300;
  const bookingFee = appointment.bookingFee || 40;
  const totalAmount = appointment.totalAmount || (consultationFee + bookingFee);
  const doctorName =
    typeof appointment.doctor === 'object'
      ? appointment.doctor.name
      : appointment.doctor || 'Doctor';
  const specialty =
    typeof appointment.doctor === 'object'
      ? appointment.doctor.specialty
      : appointment.specialty || '';

  const handleDownload = async () => {
    try {
      await Share.share({
        message:
          `🏥 Mediqzy – Consultation Bill\n\n` +
          `Patient: ${appointment.patientName || 'Self'}\n` +
          `Doctor: ${doctorName}\n` +
          `Specialty: ${specialty}\n` +
          `Consultation No: ${appointment.consultationNo || 'N/A'}\n` +
          `Date: ${appointment.date || 'N/A'}\n` +
          `Time: ${appointment.time || 'N/A'}\n` +
          `Type: ${appointment.type === 'online' ? 'Online' : 'In-Clinic'}\n\n` +
          `Consultation Fee: Rs. ${consultationFee}\n` +
          `Booking Fee: Rs. ${bookingFee}\n` +
          `Total Paid: Rs. ${totalAmount}\n` +
          `Payment Status: ${appointment.paymentStatus || 'Paid'}\n`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share bill');
    }
  };

  const handleDone = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigation.navigate('ConsultationScreen');
  };

  const BillRow = ({ label, value, highlight }) => (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>
      <Text style={[styles.billValue, highlight && styles.billValueHighlight]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consultation Bill</Text>
        <TouchableOpacity onPress={handleDownload} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={moderateScale(22)} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={moderateScale(48)} color="#4CAF50" />
            </View>
            <Text style={styles.paidLabel}>Payment Successful</Text>
            <Text style={styles.paidAmount}>Rs. {totalAmount}.00</Text>
          </View>

          <View style={styles.divider} />

          {/* Patient & Doctor Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>

            {/* Doctor Row */}
            <View style={styles.chatRow}>
              <View style={styles.avatarWrap}>
                <Image
                  source={require('../../images/IndianDoctor.png')}
                  style={styles.doctorAvatar}
                />
              </View>
              <View style={styles.chatContent}>
                <Text style={styles.chatTitle}>{doctorName}</Text>
                <Text style={styles.chatSubtitle}>{specialty}</Text>
              </View>
              <View
                style={[
                  styles.chatBtn,
                  {
                    backgroundColor:
                      appointment.type === 'online' ? '#E8F5E9' : '#FFF3E0',
                  },
                ]}
              >
                <Ionicons
                  name={appointment.type === 'online' ? 'videocam' : 'business'}
                  size={moderateScale(18)}
                  color={appointment.type === 'online' ? '#4CAF50' : '#FF9800'}
                />
              </View>
            </View>
          </View>

          <View style={styles.dividerLight} />

          {/* Bill Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <BillRow label="Patient Name" value={appointment.patientName || 'Self'} />
            <BillRow
              label="Consultation No."
              value={appointment.consultationNo || 'N/A'}
            />
            <BillRow
              label="Date"
              value={appointment.date || 'N/A'}
            />
            <BillRow
              label="Time"
              value={appointment.time || 'N/A'}
            />
            <BillRow
              label="Type"
              value={appointment.type === 'online' ? 'Online Consultation' : 'In-Clinic Visit'}
            />
          </View>

          <View style={styles.dividerLight} />

          {/* Payment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            <BillRow label="Consultation Fee" value={`Rs. ${consultationFee}`} />
            <BillRow label="Booking Fee" value={`Rs. ${bookingFee}`} />
            <View style={styles.dividerLight} />
            <BillRow
              label="Total Amount"
              value={`Rs. ${totalAmount}`}
              highlight
            />
            <BillRow
              label="Payment Method"
              value={appointment.paymentMethod || 'UPI'}
            />
            <View style={styles.statusRow}>
              <Text style={styles.billLabel}>Payment Status</Text>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>
                  {appointment.paymentStatus || 'Paid'}
                </Text>
              </View>
            </View>
          </View>

          {/* Dotted separator (receipt effect) */}
          <View style={styles.dottedDivider} />

          <View style={styles.receiptFooter}>
            <Ionicons name="shield-checkmark" size={moderateScale(16)} color="#23238E" />
            <Text style={styles.receiptFooterText}>
              Secured & Verified by Mediqzy
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Ionicons name="download-outline" size={moderateScale(20)} color="#fff" />
          <Text style={styles.downloadText}>Download Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Done Confirmation Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark" size={moderateScale(32)} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>All Done!</Text>
            <Text style={styles.modalMessage}>
              Your consultation has been booked successfully. You will receive a reminder before your appointment.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleModalClose}>
              <Text style={styles.modalBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(5),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#23238E',
  },
  backBtn: { padding: scale(4) },
  shareBtn: { padding: scale(4) },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#fff',
  },

  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: verticalScale(20),
    paddingBottom: hp(16),
  },

  // Receipt Card
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: scale(10),
  },
  receiptHeader: {
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingVertical: verticalScale(24),
  },
  successIconWrap: {
    marginBottom: verticalScale(8),
  },
  paidLabel: {
    fontSize: moderateScale(14),
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  paidAmount: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: '#222',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: verticalScale(8),
  },

  section: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#23238E',
    marginBottom: verticalScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Doctor row (chat-style)
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#F0F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: scale(12),
  },
  doctorAvatar: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    resizeMode: 'cover',
  },
  chatContent: { flex: 1, marginLeft: scale(0) },
  chatTitle: { fontSize: moderateScale(14), fontWeight: '700', color: '#222' },
  chatSubtitle: { fontWeight: '400', color: '#888', fontSize: moderateScale(12), marginTop: verticalScale(2) },
  chatBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bill rows
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  billLabel: {
    fontSize: moderateScale(13),
    color: '#888',
    flex: 1,
  },
  billValue: {
    fontSize: moderateScale(13),
    color: '#222',
    fontWeight: '600',
    textAlign: 'right',
  },
  billValueHighlight: {
    fontSize: moderateScale(16),
    color: '#23238E',
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(3),
  },
  paidBadgeText: {
    color: '#4CAF50',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },

  // Dotted receipt effect
  dottedDivider: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: scale(0),
  },
  receiptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: verticalScale(14),
  },
  receiptFooterText: {
    fontSize: moderateScale(12),
    color: '#23238E',
    fontWeight: '500',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    gap: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: scale(6),
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    gap: 8,
  },
  downloadText: { color: '#fff', fontSize: moderateScale(15), fontWeight: '600' },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doneText: { color: '#222', fontSize: moderateScale(15), fontWeight: '500' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: 'center',
    width: '100%',
  },
  modalIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  modalTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222', marginBottom: 8 },
  modalMessage: { fontSize: moderateScale(13), color: '#666', textAlign: 'center', marginBottom: verticalScale(20) },
  modalBtn: {
    width: '100%',
    backgroundColor: '#23238E',
    paddingVertical: verticalScale(14),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: moderateScale(14), fontWeight: '600' },
});
