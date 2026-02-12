import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const defaultCartItems = [
  { id: 1, name: 'AHbA1c Test (Hemoglobin A1c)', testsIncluded: 3, price: 612 },
  { id: 2, name: 'Diabetes Group Test', testsIncluded: 3, price: 1123 },
];

const patients = [
  { id: 1, name: 'D Sridhar Kumar', relation: 'Self', initial: 'D' },
  { id: 2, name: 'Shriya Kumar', relation: 'Wife', initial: 'S' },
];

export default function CartScreen({ navigation, route }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cart, setCart] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize cart from route params or default
  useEffect(() => {
    if (route.params?.cartItems && route.params.cartItems.length > 0) {
      setCart(route.params.cartItems);
    } else {
      setCart(defaultCartItems);
    }
  }, [route.params?.cartItems]);

  // Check if coming back from payment with success
  useEffect(() => {
    if (route.params?.showSuccess) {
      setShowSuccessModal(true);
      // Clear the param to prevent showing again
      navigation.setParams({ showSuccess: false });
    }
  }, [route.params?.showSuccess]);

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleProceed = () => {
    navigation.navigate('LabPaymentScreen', { type: 'lab' });
  };

  const handleTrack = () => {
    setShowSuccessModal(false);
    navigation.navigate('CollectionDetailsScreen');
  };

  const handleDownloadBill = () => {
    setShowSuccessModal(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const taxes = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + taxes;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.labBadge}>
            <Image source={require('../../images/apollo.png')} style={styles.labBadgeLogo} />
            <View>
              <Text style={styles.labBadgeTitle}>Apollo Labs</Text>
              <Text style={styles.labBadgeSubtitle}>T.nagar, Chennai</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: hp(15) }} showsVerticalScrollIndicator={false}>
          {/* Your Cart Section */}
          <Text style={styles.sectionTitle}>Your Cart ({cart.length} items)</Text>

          {cart.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <View style={styles.flaskIconContainer}>
                <Ionicons name="flask" size={moderateScale(24)} color="#23238E" />
              </View>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemSub}>{item.testsIncluded} Tests Included</Text>
                <Text style={styles.cartItemPrice}>Rs. {item.price}</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Select Patient Names */}
          <Text style={styles.sectionTitle}>Select Patient Names</Text>

          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => setSelectedPatient(patient.id)}
            >
              <View style={styles.patientInitial}>
                <Text style={styles.patientInitialText}>{patient.initial}</Text>
              </View>
              <Text style={styles.patientName}>{patient.name}</Text>
              <View style={styles.relationBadge}>
                <Text style={styles.relationText}>{patient.relation}</Text>
              </View>
              <View style={[styles.checkbox, selectedPatient === patient.id && styles.checkboxSelected]}>
                {selectedPatient === patient.id && (
                  <Ionicons name="checkmark" size={moderateScale(16)} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Payment Breakdown */}
          <Text style={styles.paymentTitle}>Payment breakdown</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal</Text>
            <Text style={styles.paymentValue}>Rs.{subtotal}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxes</Text>
            <Text style={styles.paymentValue}>Rs.{taxes}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelBold}>Total</Text>
            <Text style={styles.paymentValueBold}>Rs.{total}</Text>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomTotal}>Rs.{total}</Text>
          </View>
          <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
            <Text style={styles.proceedBtnText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Payment Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay} />
          <View style={styles.successModal}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={moderateScale(40)} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Payment Success</Text>
            <Text style={styles.successMessage}>
              Your payment has been successful,{'\n'}you can track your order now.
            </Text>
            <View style={styles.successBtnRow}>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadBill}>
                <Text style={styles.downloadBtnText}>Bill</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
                <Text style={styles.trackBtnText}>Track</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: scale(12) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222', flex: 1 },
  labBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: scale(20),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
  },
  labBadgeLogo: { width: scale(24), height: scale(24), borderRadius: scale(12), marginRight: scale(8) },
  labBadgeTitle: { fontSize: moderateScale(12), fontWeight: '600', color: '#222' },
  labBadgeSubtitle: { fontSize: moderateScale(10), color: '#888' },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: wp(4),
    marginTop: hp(2.5),
    marginBottom: hp(1.5)
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E8EDF5',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  flaskIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(10),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: moderateScale(15), fontWeight: '600', color: '#222', marginBottom: verticalScale(4) },
  cartItemSub: { fontSize: moderateScale(12), color: '#888', marginBottom: verticalScale(4) },
  cartItemPrice: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#23238E' },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: scale(6),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    alignSelf: 'center',
  },
  removeBtnText: { fontSize: moderateScale(12), color: '#222', fontWeight: '500' },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E8EDF5',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  patientInitial: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  patientInitialText: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#23238E' },
  patientName: { flex: 1, fontSize: moderateScale(15), fontWeight: '600', color: '#222' },
  relationBadge: {
    backgroundColor: '#23238E',
    borderRadius: scale(6),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
    marginRight: scale(12),
  },
  relationText: { fontSize: moderateScale(12), color: '#fff', fontWeight: '500' },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(4),
    borderWidth: 1.5,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  paymentTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: wp(4),
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(4),
    marginBottom: verticalScale(8),
  },
  paymentLabel: { fontSize: moderateScale(14), color: '#666' },
  paymentValue: { fontSize: moderateScale(14), color: '#666' },
  paymentLabelBold: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#222' },
  paymentValueBold: { fontSize: moderateScale(15), fontWeight: 'bold', color: '#222' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
  },
  bottomLabel: { fontSize: moderateScale(12), color: '#888' },
  bottomTotal: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#222' },
  proceedBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: wp(12),
  },
  proceedBtnText: { color: '#fff', fontWeight: 'bold', fontSize: moderateScale(16) },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    paddingVertical: hp(5),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    width: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  checkCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  successTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp(1.5),
  },
  successMessage: {
    fontSize: moderateScale(14),
    color: '#888',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: hp(3.5),
  },
  successBtnRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
  },
  downloadBtnText: {
    fontSize: moderateScale(14),
    color: '#222',
    fontWeight: '500',
  },
  trackBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(40),
  },
  trackBtnText: {
    fontSize: moderateScale(14),
    color: '#fff',
    fontWeight: 'bold',
  },
});
