import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Modal, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { saveAppointment } from '../../Utils/firebaseDatabase';
import { scheduleAppointmentReminders, displayNotification } from '../../Utils/localNotifications';

const paymentMethods = [
  { key: 'card', label: 'Credit / Debit Card', icons: ['visa', 'mastercard'] },
  { key: 'upi', label: 'UPI', icons: ['upi'] },
  { key: 'netbanking', label: 'Net banking', icons: ['bank'] },
  { key: 'clinic', label: 'Pay at Clinic', icons: [] },
];

const banks = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
];

export default function PaymentMethodsScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

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

  const handleMethodSelect = (methodKey) => {
    if (methodKey === 'clinic') return;
    setSelected(methodKey);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      // Calculate fees dynamically
      const consultationFee = appointment.fee ?? (appointment.price ?? 300);
      const bookingFee = appointment.bookingFee ?? 40;
      const totalAmount = consultationFee + bookingFee;
      const patientPhone = appointment.patientPhone || appointment.mobileNumber || '';

      // Save appointment to Firebase
      const appointmentData = {
        doctor: {
          name: appointment.doctor?.name || appointment.doctor,
          specialty: appointment.doctor?.specialty || appointment.specialty,
          id: appointment.doctor?.id || appointment.doctorID || '',
        },
        patientName: appointment.patientName || 'Self',
        patientId: appointment.patientId || '',
        patientPhone: patientPhone || appointment.mobileNumber || '',
        patientEmail: appointment.email || appointment.userEmail || '',
        problem: appointment.problem || '',
        consultationNo: appointment.consultationNo || `APPT${Date.now().toString().slice(-7)}`,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type || 'online',
        status: 'upcoming',
        paymentMethod: selected,
        fee: consultationFee,
        bookingFee: bookingFee,
        totalAmount: totalAmount,
        amount: totalAmount,
        paymentStatus: 'Paid',
        orderId: appointment.consultationId || `ORDER${Date.now().toString().slice(-7)}`,
        location: (appointment.type !== 'online' && appointment.status !== 'Online') ? (appointment.location || 'Apollo Hospitals, Velachery') : null,
        createdAt: new Date().toISOString(),
      };

      const result = await saveAppointment(appointmentData);

      if (result.success) {
        // Schedule notifications
        const notificationData = { ...appointmentData, id: result.key };
        await scheduleAppointmentReminders(notificationData);

        await displayNotification({
          title: '✅ Appointment Booked!',
          body: `Your appointment with ${appointmentData.doctor.name} is confirmed for ${appointmentData.date} at ${appointmentData.time}.`,
          channelId: 'mediqzy_orders',
          data: { type: 'appointment_reminder', appointmentId: result.key }
        });

        setAppointmentId(result.key);
        setShowModal(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to save appointment');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadBill = () => {
    setShowSuccessModal(false);
    navigation.navigate('ConsultationBillScreen', { appointmentId, appointment });
  };

  const renderModalContent = () => {
    switch (selected) {
      case 'card':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Enter Card Details</Text>
            <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor="#aaa" keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: scale(12) }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Expiry date" placeholderTextColor="#aaa" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor="#aaa" keyboardType="numeric" secureTextEntry />
            </View>
            <TextInput style={styles.input} placeholder="Card Holder's Name" placeholderTextColor="#aaa" />
            <View style={styles.saveCardRow}>
              <View style={styles.checkbox} />
              <Text style={styles.saveCardText}>Save Card details</Text>
            </View>
            <TouchableOpacity style={styles.modalProceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Pay Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'upi':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Enter UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@upi"
              placeholderTextColor="#aaa"
              value={upiId}
              onChangeText={setUpiId}
            />
            <Text style={styles.upiHint}>Enter your UPI ID linked with your bank account</Text>
            <TouchableOpacity style={styles.modalProceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Pay Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'netbanking':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Select Your Bank</Text>
            <ScrollView style={{ maxHeight: verticalScale(200) }}>
              {banks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[styles.bankRow, selectedBank === bank.id && styles.bankRowActive]}
                  onPress={() => setSelectedBank(bank.id)}
                >
                  <View style={styles.radioOuter}>
                    <View style={[styles.radioInner, selectedBank === bank.id && styles.radioChecked]} />
                  </View>
                  <Text style={styles.bankName}>{bank.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalProceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Pay Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Select a payment method</Text>

          <View style={styles.methodList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.key}
                style={[styles.methodRow, selected === method.key && styles.methodRowActive, method.key === 'clinic' && styles.disabledRow]}
                onPress={() => handleMethodSelect(method.key)}
                disabled={method.key === 'clinic'}
              >
                <View style={styles.radioOuter}>
                  <View style={[styles.radioInner, selected === method.key && styles.radioChecked]} />
                </View>
                <Text style={[styles.methodLabel, method.key === 'clinic' && styles.disabledText]}>{method.label}</Text>
                {method.icons.includes('visa') && <Image source={require('../../images/Visa.png')} style={styles.icon} />}
                {method.icons.includes('mastercard') && <Image source={require('../../images/Mastercard.png')} style={styles.icon} />}
                {method.icons.includes('upi') && <Image source={require('../../images/UPI.png')} style={styles.icon} />}
                {method.icons.includes('bank') && <Image source={require('../../images/bank.png')} style={styles.icon} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.couponBox}>
            <Image source={require('../../images/coupon.png')} style={styles.couponIcon} />
            <Text style={styles.couponText}>₹ 40 OFF saved</Text>
            <Text style={styles.couponApplied}>✓ Applied</Text>
          </View>
          <TouchableOpacity
            style={styles.couponLinkRow}
            onPress={() => navigation.navigate('CouponScreen')}
          >
            <Text style={styles.couponLink}>View all coupons {'>'}</Text>
          </TouchableOpacity>

        </ScrollView>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.proceedBtn, !selected && styles.proceedBtnDisabled]}
            onPress={() => selected && setShowModal(true)}
            disabled={!selected}
          >
            <Text style={styles.proceedBtnText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Payment Method Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.closeBtn} onPress={handleCloseModal}>
                <Ionicons name="close" size={moderateScale(24)} color="#333" />
              </TouchableOpacity>
            </View>
            {renderModalContent()}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },
  scrollContent: { paddingBottom: hp(12) },
  title: { fontSize: moderateScale(18), fontWeight: 'bold', marginHorizontal: wp(5), marginTop: hp(2.5), marginBottom: hp(1.5), color: '#222' },
  methodList: { marginHorizontal: wp(5) },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#eee'
  },
  methodRowActive: { borderColor: '#23238E', backgroundColor: '#f5f7ff' },
  disabledRow: { backgroundColor: '#f2f2f2' },
  radioOuter: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12)
  },
  radioInner: { width: scale(12), height: scale(12), borderRadius: scale(6), backgroundColor: '#fff' },
  radioChecked: { backgroundColor: '#23238E' },
  methodLabel: { fontSize: moderateScale(16), flex: 1, color: '#222' },
  disabledText: { color: '#bbb' },
  icon: { width: scale(36), height: verticalScale(24), marginLeft: scale(8), resizeMode: 'contain' },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(16),
    color: '#222'
  },
  saveCardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
  checkbox: { width: scale(20), height: scale(20), borderWidth: 1, borderColor: '#23238E', borderRadius: scale(4), marginRight: scale(8) },
  saveCardText: { color: '#23238E', fontSize: moderateScale(14) },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: wp(5),
    padding: scale(12),
    marginTop: verticalScale(10)
  },
  couponIcon: { width: scale(28), height: scale(28), marginRight: scale(8) },
  couponText: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(14), flex: 1 },
  couponApplied: { color: 'green', fontWeight: 'bold', fontSize: moderateScale(14) },
  couponLinkRow: { marginHorizontal: wp(5), marginBottom: verticalScale(10) },
  couponLink: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(14), marginTop: verticalScale(4) },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff'
  },
  totalLabel: { color: '#888', fontSize: moderateScale(16) },
  totalValue: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(22) },
  proceedBtn: { backgroundColor: '#23238E', borderRadius: scale(12), paddingVertical: verticalScale(14), paddingHorizontal: wp(10) },
  proceedBtnDisabled: { backgroundColor: '#aaa' },
  proceedBtnText: { color: '#fff', fontSize: moderateScale(18), fontWeight: 'bold' },
  proceedText: { color: '#fff', fontSize: moderateScale(18), fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingBottom: hp(4),
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: hp(1.5),
    paddingHorizontal: wp(5),
  },
  modalHandle: {
    width: scale(40),
    height: verticalScale(4),
    backgroundColor: '#ddd',
    borderRadius: scale(2),
    marginBottom: verticalScale(10),
  },
  closeBtn: {
    position: 'absolute',
    right: wp(5),
    top: hp(1.5),
  },
  modalBody: {
    padding: scale(20),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(20),
  },
  modalProceedBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  upiHint: {
    color: '#888',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(20),
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(14),
    borderRadius: scale(10),
    marginBottom: verticalScale(8),
    backgroundColor: '#f8f8f8',
  },
  bankRowActive: {
    backgroundColor: '#f0f0ff',
    borderWidth: 1,
    borderColor: '#23238E',
  },
  bankName: {
    fontSize: moderateScale(16),
    color: '#333',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(32),
    alignItems: 'center',
    marginHorizontal: wp(8),
    width: wp(85),
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
    paddingHorizontal: wp(8),
    gap: scale(8),
  },
  downloadBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
  },
});
