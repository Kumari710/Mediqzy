import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getUserProfile } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function BookingConfirmScreen({ navigation, route }) {
  const appointment = route?.params?.appointment || {
    doctor: 'Dr. Suresh Tanmani',
    specialty: 'General Physician',
    patientName: 'Shivakumar',
    consultationNo: 'RK9755472',
    date: '8.05.25',
    time: '11:00 AM',
    type: 'online',
  };

  const isOnline = appointment.type === 'online';

  const [patientName, setPatientName] = useState(appointment.patientName || '');
  const [mobileNumber, setMobileNumber] = useState(appointment.patientPhone || '');
  const [email, setEmail] = useState('');
  const [problem, setProblem] = useState(appointment.problem || '');
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  React.useEffect(() => {
    const fetchUserData = async () => {
      const user = getCurrentUser();
      if (user) {
        setEmail(user.email || '');
        const profileRes = await getUserProfile();
        if (profileRes.success && profileRes.data) {
          if (!mobileNumber && !appointment.patientPhone) setMobileNumber(profileRes.data.phoneNumber || profileRes.data.phone || '');
          if (!patientName && !appointment.patientName) setPatientName(profileRes.data.displayName || profileRes.data.name || '');
        }
      }
    };
    fetchUserData();
  }, []);

  const handlePayNow = () => {
    if (!mobileNumber.trim()) {
      setShowErrorModal(true);
      return;
    }

    navigation.navigate('PaymentMethodsScreen', {
      appointment: {
        ...appointment,
        patientName,
        mobileNumber,
        email,
        problem,
        bookingDate: new Date().toISOString()
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(15) }}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorHeader}>
            <Image source={require('../../images/IndianDoctor.png')} style={styles.doctorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{appointment.doctor?.name || appointment.doctor}</Text>
              <Text style={styles.doctorSpecialty}>{appointment.doctor?.specialty || appointment.specialty}</Text>
            </View>
            <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
              <Text style={[styles.statusBadgeText, !isOnline && styles.offlineBadgeText]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.priceRatingRow}>
            <Text style={styles.priceLabel}>Price: <Text style={styles.priceValue}>Rs. {appointment.fee ?? 0}</Text></Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="thumbs-up" size={moderateScale(14)} color="#4CAF50" />
              <Text style={styles.ratingText}>94%</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Patient name</Text>
              <Text style={styles.infoValue}>{patientName || 'Not Selected'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Consultation No.</Text>
              <Text style={styles.infoValue}>{appointment.consultationNo || 'RK9755472'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Date</Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{appointment.date || '8.05.25'}</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Time</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{appointment.time || '11:00 AM'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hospital Card - Only for Offline */}
        {!isOnline && (
          <View style={styles.hospitalCard}>
            <Image source={require('../../images/apollo.png')} style={styles.hospitalLogo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.hospitalName}>Apollo Hospital</Text>
              <Text style={styles.hospitalAddress}>T.nagar, Chennai 600017</Text>
            </View>
            <View style={styles.mapIconContainer}>
              <Ionicons name="location" size={moderateScale(24)} color="#E53935" />
            </View>
          </View>
        )}

        {/* Patient Contact Details */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <Text style={styles.inputLabel}>Patient Name</Text>
          <TextInput
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Enter patient name"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>91+</Text>
            <View style={styles.phoneDivider} />
            <TextInput
              style={styles.phoneInput}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.inputLabel}>What is the problem/symptoms?</Text>
          <TextInput
            style={[styles.input, { minHeight: verticalScale(80), textAlignVertical: 'top' }]}
            value={problem}
            onChangeText={setProblem}
            placeholder="e.g. Fever, Headache for 2 days..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {/* Total Charges */}
        <View style={styles.chargesSection}>
          <Text style={styles.chargesTitle}>Total Charges</Text>

          <View style={styles.chargeRow}>
            <Text style={styles.chargeLabel}>Consultation Fees</Text>
            <Text style={styles.chargeValue}>Rs. {appointment.fee ?? 0}</Text>
          </View>

          <View style={styles.chargeRow}>
            <Text style={styles.chargeLabel}>Booking Fees</Text>
            <Text style={styles.chargeValue}>Rs. {appointment.bookingFee ?? 40}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.payTotalLabel}>Pay Total</Text>
          <Text style={styles.payTotalValue}>Rs.{(appointment.fee ?? 0) + (appointment.bookingFee ?? 40)}.00</Text>
        </View>
        <TouchableOpacity style={styles.payNowBtn} onPress={handlePayNow}>
          <Text style={styles.payNowBtnText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
      {/* Custom Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={moderateScale(40)} color="#FF6B35" />
            </View>
            <Text style={styles.modalTitle}>Missing Details</Text>
            <Text style={styles.modalText}>Please enter a mobile number to proceed.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
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
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },

  // Doctor Card
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(16),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: '#666',
    marginTop: verticalScale(2),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(6),
  },
  onlineBadge: {
    backgroundColor: '#23238E',
  },
  offlineBadge: {
    backgroundColor: '#FF6B35',
  },
  statusBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#fff',
  },
  offlineBadgeText: {
    color: '#fff',
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  priceLabel: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#222',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  ratingText: {
    marginLeft: scale(4),
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: verticalScale(12),
  },
  infoCol: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: moderateScale(11),
    color: '#999',
    marginBottom: verticalScale(4),
  },
  infoValue: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#222',
  },
  dateBadge: {
    backgroundColor: '#E8E8F0',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(4),
  },
  dateBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#23238E',
  },
  timeBadge: {
    backgroundColor: '#E8E8F0',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(4),
  },
  timeBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#23238E',
  },

  // Hospital Card
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginTop: verticalScale(12),
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hospitalLogo: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(8),
    marginRight: scale(12),
    resizeMode: 'contain',
  },
  hospitalName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#222',
  },
  hospitalAddress: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
  mapIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Contact Section
  contactSection: {
    marginHorizontal: wp(4),
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(16),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    color: '#666',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: scale(14),
    fontSize: moderateScale(15),
    color: '#222',
    marginBottom: verticalScale(16),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: verticalScale(16),
  },
  countryCode: {
    fontSize: moderateScale(15),
    color: '#222',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  phoneDivider: {
    width: 1,
    height: verticalScale(24),
    backgroundColor: '#E0E0E0',
  },
  phoneInput: {
    flex: 1,
    padding: scale(14),
    fontSize: moderateScale(15),
    color: '#222',
  },

  // Charges Section
  chargesSection: {
    marginHorizontal: wp(4),
    marginTop: verticalScale(8),
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chargesTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(16),
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  chargeLabel: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  chargeValue: {
    fontSize: moderateScale(14),
    color: '#222',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: verticalScale(12),
    marginTop: verticalScale(4),
  },
  totalLabel: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#222',
  },
  totalValue: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#23238E',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    paddingBottom: hp(4),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  payTotalLabel: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  payTotalValue: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
  },
  payNowBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: wp(12),
  },
  payNowBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(24),
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalIconContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#FFF0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(8),
  },
  modalText: {
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
  },
  modalButton: {
    backgroundColor: '#23238E',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(32),
    borderRadius: scale(10),
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});
