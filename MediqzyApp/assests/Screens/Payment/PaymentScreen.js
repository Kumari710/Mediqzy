import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Modal, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { pushData, createNotification } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { getCartItems, getCartTotal, clearCart } from '../../Utils/firebasePharmacyStorage';
import { showOrderPlacedNotification } from '../../Utils/localNotifications';

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

export default function PaymentScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [couponApplied, setCouponApplied] = useState(true);
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, taxes: 0, total: 0 });

  // Use unified bookingDetails if present in route params
  const bookingDetails = route?.params?.bookingDetails;

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    if (bookingDetails) {
      setCartItems(bookingDetails.items || []);
      setTotals(bookingDetails.summary || { subtotal: 0, taxes: 0, total: 0 });
      return;
    }
    const items = await getCartItems();
    const cartTotals = await getCartTotal();
    setCartItems(items);
    setTotals(cartTotals);
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
    setProcessing(true);

    // Choose destination based on route params
    const type = route?.params?.type || 'pharmacy';

    if (type === 'pharmacy') {
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('Login Required', 'Please login to place an order');
        setProcessing(false);
        return;
      }

      try {
        // Ensure we have cart items - reload if empty
        let orderItems = cartItems;
        let orderTotals = totals;

        if (!orderItems || orderItems.length === 0) {
          console.log('Cart empty, reloading from Firebase...');
          orderItems = await getCartItems();
          orderTotals = await getCartTotal();
        }

        if (!orderItems || orderItems.length === 0) {
          Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
          setProcessing(false);
          return;
        }

        console.log('Creating order with items:', orderItems.length);

        // Generate unique order ID
        const orderId = `PHARM${Date.now().toString().slice(-7)}`;

        // IMMUTABLE ORDER OBJECT based on either bookingDetails or legacy params
        const order = bookingDetails ? {
          orderId: orderId,
          userId: user.uid,
          status: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod: selected || 'UPI',
          ...bookingDetails,
          // Ensure total is correctly reflected
          total: totals.total,
        } : {
          orderId: orderId,
          userId: user.uid,
          type: 'pharmacy',
          userEmail: user.email || user.phoneNumber,
          pharmacy: {
            name: 'Apollo Pharmacy',
            address: route?.params?.location?.address || 'T.nagar, Chennai 600017',
          },
          deliveryAddress: route?.params?.location?.address || '123, 4th Cross Street, T. Nagar, Chennai - 600017',
          items: orderItems.map(item => ({
            id: String(item.id),
            name: String(item.name || 'Unknown Product'),
            desc: String(item.desc || ''),
            qty: parseInt(item.qty) || 1,
            price: parseFloat(item.price) || 0,
            imageName: item.imageName || 'drug1.png',
          })),
          subtotal: orderTotals.subtotal,
          taxes: orderTotals.taxes,
          total: orderTotals.total,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        console.log('Order items saved:', JSON.stringify(order.items));
        console.log('[PaymentScreen] User ID:', user.uid);
        console.log('[PaymentScreen] Order total:', order.total);
        console.log('[PaymentScreen] Saving pharmacy order to Firebase...');

        // Save to pharmacyOrders (user-specific)
        const result = await pushData(`pharmacyOrders/${user.uid}`, order);
        console.log('[PaymentScreen] PharmacyOrders save result:', result);

        if (result.success) {
          console.log('[PaymentScreen] Pharmacy order saved with key:', result.key);

          // Also save to allOrders (global - for admin view and combined orders screen)
          const allOrdersResult = await pushData('allOrders', {
            ...order,
            orderType: 'pharmacy'
          });
          console.log('[PaymentScreen] AllOrders save result:', allOrdersResult);

          // Create database notification
          await createNotification(user.uid, {
            type: 'order',
            title: 'Order Placed Successfully',
            message: `Your order #${orderId} has been placed.`,
            data: { orderId: orderId },
          });

          // Show local push notification
          await showOrderPlacedNotification({
            orderId: orderId,
            orderType: 'pharmacy',
            total: orderTotals.total,
            itemCount: orderItems.length,
          });

          // Clear the cart
          await clearCart();

          setShowModal(false);
          navigation.navigate('DeliveryStatusScreen', { orderId: result.key, order: { id: result.key, ...order } });
        } else {
          Alert.alert('Error', result.error || 'Failed to place order');
        }
      } catch (error) {
        console.log('Order error:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setProcessing(false);
      }
    } else if (type === 'consultation') {
      setShowModal(false);
      navigation.navigate('ConsultationBillScreen', {
        appointmentData: route?.params?.appointmentData || {}
      });
      setProcessing(false);
    } else if (type === 'lab') {
      setShowModal(false);
      navigation.navigate('CartScreen', { showSuccess: true });
      setProcessing(false);
    } else {
      setShowModal(false);
      navigation.goBack();
      setProcessing(false);
    }
  };

  const renderModalContent = () => {
    switch (selected) {
      case 'card':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Enter Card Details</Text>
            <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor="#aaa" keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: scale(12) }} >
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Expiry date" placeholderTextColor="#aaa" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor="#aaa" keyboardType="numeric" secureTextEntry />
            </View>
            <TextInput style={styles.input} placeholder="Card Holder's Name" placeholderTextColor="#aaa" />
            <View style={styles.saveCardRow}>
              <View style={styles.checkbox} />
              <Text style={styles.saveCardText}>Save Card details</Text>
            </View>
            <TouchableOpacity style={[styles.modalProceedBtn, processing && { opacity: 0.7 }]} onPress={handleProceed} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedText}>Pay Rs.{totals.total}</Text>}
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
            <TouchableOpacity style={[styles.modalProceedBtn, processing && { opacity: 0.7 }]} onPress={handleProceed} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedText}>Pay Rs.{totals.total}</Text>}
            </TouchableOpacity>
          </View>
        );
      case 'netbanking':
        return (
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Select Your Bank</Text>
            <ScrollView style={{ maxHeight: hp(25) }} >
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
            <TouchableOpacity style={[styles.modalProceedBtn, processing && { opacity: 0.7 }]} onPress={handleProceed} disabled={processing}>
              {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.proceedText}>Pay Rs.{totals.total}</Text>}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Payment</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Select a payment method</Text>
          <View style={styles.methodList}>
            {paymentMethods.map((method, idx) => (
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
            <Text style={styles.couponText}>₹ 1500 OFF% saved</Text>
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
            <Text style={styles.totalValue}>Rs.{totals.total}</Text>
          </View>
          <TouchableOpacity
            style={[styles.proceedBtn, !selected && styles.proceedBtnDisabled]}
            onPress={() => selected && setShowModal(true)}
            disabled={!selected}
          >
            <Text style={styles.proceedText}>Proceed</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Modal */}
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
      </SafeAreaView>
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
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerText: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },
  title: { fontSize: moderateScale(20), fontWeight: 'bold', marginHorizontal: wp(5), marginTop: hp(2), marginBottom: hp(1) },
  methodList: { marginHorizontal: wp(5) },
  methodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: scale(12), padding: scale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: '#eee' },
  methodRowActive: { borderColor: '#23238E', backgroundColor: '#f5f7ff' },
  disabledRow: { backgroundColor: '#f2f2f2' },
  radioOuter: { width: scale(24), height: scale(24), borderRadius: scale(12), borderWidth: 2, borderColor: '#bbb', alignItems: 'center', justifyContent: 'center', marginRight: scale(12) },
  radioInner: { width: scale(12), height: scale(12), borderRadius: scale(6), backgroundColor: '#fff' },
  radioChecked: { backgroundColor: '#23238E' },
  methodLabel: { fontSize: moderateScale(18), flex: 1 },
  disabledText: { color: '#bbb' },
  icon: { width: scale(36), height: verticalScale(24), marginLeft: scale(8), resizeMode: 'contain' },
  input: { backgroundColor: '#f2f2f2', borderRadius: scale(8), padding: scale(12), marginBottom: verticalScale(10), fontSize: moderateScale(16), color: '#23238E' },
  saveCardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
  checkbox: { width: scale(20), height: scale(20), borderWidth: 1, borderColor: '#23238E', borderRadius: scale(4), marginRight: scale(8) },
  saveCardText: { color: '#23238E', fontSize: moderateScale(16) },
  couponBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: scale(8), borderWidth: 1, borderColor: '#eee', marginHorizontal: wp(5), padding: scale(12), marginTop: verticalScale(10) },
  couponIcon: { width: scale(28), height: scale(28), marginRight: scale(8) },
  couponText: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(16), flex: 1 },
  couponApplied: { color: 'green', fontWeight: 'bold', fontSize: moderateScale(16) },
  couponLinkRow: { marginHorizontal: wp(5), marginBottom: hp(1.5) },
  couponLink: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(16), marginTop: verticalScale(4) },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(5), paddingVertical: hp(2), borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { color: '#888', fontSize: moderateScale(18) },
  totalValue: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(22) },
  proceedBtn: { backgroundColor: '#23238E', borderRadius: scale(12), paddingVertical: verticalScale(14), paddingHorizontal: wp(10) },
  proceedBtnDisabled: { backgroundColor: '#aaa' },
  proceedText: { color: '#fff', fontSize: moderateScale(20), fontWeight: 'bold' },
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
    fontSize: moderateScale(20),
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
});
