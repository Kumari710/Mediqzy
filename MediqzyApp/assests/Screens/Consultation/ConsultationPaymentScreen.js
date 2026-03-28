import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function ConsultationPaymentScreen({ navigation, route }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState(null);

  const appointment = route?.params?.appointment || {
    doctor: 'Dr. Suresh Tanmani',
    specialty: 'General Physician',
    status: 'Online',
    patientName: 'Shivakumar',
    consultationNo: 'RK9755472',
    date: '21.05.25',
    time: '11:00 AM',
    type: 'online',
  };

  const isOnline = appointment.type === 'online' || appointment.status === 'Online';

  // Calculate fees dynamically from appointment data
  const consultationFee = appointment.fee || 300;
  const bookingFee = 40;
  const totalAmount = consultationFee + bookingFee;

  const handlePayNow = async () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Login Required', 'Please login to book an appointment');
      return;
    }

    // Generate unique consultation ID
    const consultationId = `APPT${Date.now().toString().slice(-7)}`;

    // Prepare appointment data but don't save yet to avoid duplicates
    // Consistency with Lab flow: Save after payment selection
    const appointmentData = {
      consultationId: consultationId,
      doctor: {
        name: appointment.doctor?.name || appointment.doctor,
        specialty: appointment.doctor?.specialty || appointment.specialty,
      },
      patientName: appointment.patientName || 'Self',
      date: appointment.date,
      fullDate: appointment.fullDate || appointment.date,
      time: appointment.time,
      type: isOnline ? 'online' : 'clinic',
      hospital: appointment.hospital || { name: 'Apollo Hospital', address: 'T.nagar, Chennai' },
      location: (appointment.type !== 'online' && appointment.status !== 'Online') ? (appointment.location || 'Apollo Hospitals, Velachery') : null,
      fee: consultationFee,
      bookingFee: bookingFee,
      totalAmount: totalAmount,
    };

    // Navigate to payment with appointment data
    navigation.navigate('PaymentMethodsScreen', {
      appointment: { ...appointment, ...appointmentData },
      type: 'consultation',
      amount: totalAmount,
    });
  };

  const handleDownloadBill = () => {
    setShowSuccessModal(false);
    navigation.navigate('ConsultationBillScreen', { appointment });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(15), marginTop: verticalScale(20) }}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorHeader}>
            <Image source={require('../../images/IndianDoctor.png')} style={styles.doctorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{appointment.doctor}</Text>
              <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
            </View>
            <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
              <Text style={styles.statusBadgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          <View style={styles.priceRatingRow}>
            <Text style={styles.priceLabel}>Price: <Text style={styles.priceValue}>Rs. {consultationFee}</Text></Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="thumbs-up" size={moderateScale(14)} color="#4CAF50" />
              <Text style={styles.ratingText}>94%</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Patient name</Text>
              <Text style={styles.infoValue}>{appointment.patientName}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Consultation No.</Text>
              <Text style={styles.infoValue}>{appointment.consultationNo}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{appointment.date}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{appointment.time}</Text>
            </View>
          </View>
        </View>

        {/* Coupon Section */}
        <View style={styles.couponCard}>
          <View style={styles.couponInfo}>
            <Text style={styles.expiresLabel}>Expires</Text>
            <Text style={styles.expiresDate}>12th July, 2025</Text>
            <Text style={styles.termsText}>Terms and Conditions Apply</Text>
          </View>
          <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.navigate('CouponScreen')}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

        {/* Total Charges */}
        <View style={styles.totalSection}>
          <Text style={styles.totalChargesTitle}>Total Charges</Text>
          <View style={styles.payTotalRow}>
            <Text style={styles.payTotalLabel}>Pay Total</Text>
          </View>
          <Text style={styles.totalAmount}>Rs.{totalAmount}.00</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payNowBtn, booking && { opacity: 0.7 }]}
          onPress={handlePayNow}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payNowBtnText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={moderateScale(48)} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Payment Success</Text>
            <Text style={styles.successMessage}>
              Your payment has been successful, you can track your order now.
            </Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadBill}>
              <Ionicons name="download-outline" size={moderateScale(20)} color="#222" />
              <Text style={styles.downloadBtnText}>Download Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(5),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#23238E',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#fff', marginLeft: scale(12) },
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(20),
    borderRadius: scale(16),
    padding: scale(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  doctorAvatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    marginRight: scale(12),
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#23238E',
  },
  doctorSpecialty: {
    fontSize: moderateScale(13),
    color: '#888',
    marginTop: verticalScale(2),
  },
  statusBadge: {
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
  },
  onlineBadge: {
    backgroundColor: '#23238E',
  },
  offlineBadge: {
    backgroundColor: '#FF9800',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  priceLabel: {
    fontSize: moderateScale(14),
    color: '#555',
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#222',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: moderateScale(10),
    color: '#888',
    marginBottom: verticalScale(4),
  },
  infoValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#222',
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  couponInfo: {
    flex: 1,
  },
  expiresLabel: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  expiresDate: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
    marginTop: verticalScale(2),
  },
  termsText: {
    fontSize: moderateScale(11),
    color: '#23238E',
    marginTop: verticalScale(4),
  },
  applyBtn: {
    backgroundColor: '#E53935',
    borderRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  applyBtnText: {
    color: '#fff',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  totalSection: {
    marginHorizontal: wp(4),
    marginTop: verticalScale(24),
  },
  totalChargesTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(8),
  },
  payTotalRow: {
    marginBottom: verticalScale(4),
  },
  payTotalLabel: {
    fontSize: moderateScale(14),
    color: '#555',
  },
  totalAmount: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#222',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: scale(16),
    paddingBottom: hp(4),
  },
  payNowBtn: {
    backgroundColor: '#E53935',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  payNowBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(32),
    alignItems: 'center',
    marginHorizontal: wp(8),
    width: wp(84),
  },
  successIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(12),
  },
  successMessage: {
    fontSize: moderateScale(14),
    color: '#888',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(24),
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: scale(8),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(32),
    gap: scale(8),
  },
  downloadBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
  },
});
