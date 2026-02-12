import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { pushData, createNotification } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { clearCart } from '../../Utils/firebasePharmacyStorage';

const PharmacyBillScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items = [], pharmacy = {}, subtotal = 0, taxes = 0, total = 0 } = route.params || {};
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Login Required', 'Please login to place an order');
      return;
    }

    setPlacing(true);
    try {
      // Create order object
      const order = {
        userId: user.uid,
        type: 'pharmacy',
        userEmail: user.email || user.phoneNumber,
        pharmacy: {
          name: pharmacy.name || 'Apollo Pharmacy',
          address: pharmacy.address || 'T.nagar, Chennai 600017',
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          desc: item.desc,
          qty: item.qty,
          price: item.price,
        })),
        subtotal,
        taxes,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save to Firebase Realtime Database
      const result = await pushData(`pharmacyOrders/${user.uid}`, order);

      if (result.success) {
        // Also save to global orders for pharmacy/admin view
        await pushData('allOrders', {
          ...order,
          orderId: result.key,
          orderType: 'pharmacy'
        });

        // Create notification for order placed
        await createNotification(user.uid, {
          type: 'order',
          title: 'Order Placed Successfully',
          message: `Your order #${result.key.slice(-6).toUpperCase()} has been placed. We'll notify you when it's on the way!`,
          data: {
            orderId: result.key,
            orderType: 'pharmacy'
          },
        });

        // Clear the pharmacy cart after successful order
        await clearCart();

        Alert.alert(
          'Order Placed! 🎉',
          `Your order #${result.key.slice(-6).toUpperCase()} has been placed successfully.`,
          [
            {
              text: 'Track Order',
              onPress: () => navigation.navigate('DeliveryStatusScreen', { orderId: result.key }),
            },
            {
              text: 'Go Home',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] }),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to place order');
      }
    } catch (error) {
      console.log('Order error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pharmacy Bill</Text>
          <View style={{ width: scale(40) }} />
        </View>

        {/* Pharmacy Info */}
        <View style={styles.pharmacyInfo}>
          <Image source={pharmacy.logo || require('../../images/apollo.png')} style={styles.pharmacyLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pharmacyName}>{pharmacy.name || 'Apollo Pharmacy'}</Text>
            <Text style={styles.pharmacyAddr}>{pharmacy.address || 'T.nagar, Chennai 600017'}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call-outline" size={moderateScale(22)} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <Text style={styles.itemsTitle}>Items Details</Text>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image source={item.image || require('../../images/drug1.png')} style={styles.itemImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.itemQty}>x{item.qty}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
            </View>
          )}
          keyExtractor={item => item.id?.toString()}
          style={{ marginBottom: verticalScale(10) }}
          showsVerticalScrollIndicator={false}
        />

        {/* Payment Breakdown */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Payment Breakdown</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal</Text>
            <Text style={styles.paymentValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxes & Fees</Text>
            <Text style={styles.paymentValue}>₹{taxes}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelBold}>Total</Text>
            <Text style={styles.paymentValueBold}>₹{total}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.placeOrderBtn, placing && styles.btnDisabled]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order - ₹{total}</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1, paddingHorizontal: wp(4) },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: scale(12),
    padding: scale(12),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(10),
  },
  pharmacyLogo: { width: scale(48), height: scale(48), marginRight: scale(10), borderRadius: scale(8) },
  pharmacyName: { fontWeight: '600', fontSize: moderateScale(15), color: '#222' },
  pharmacyAddr: { color: '#888', fontSize: moderateScale(13), marginTop: verticalScale(2) },
  callBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: scale(20),
    padding: scale(10),
    marginLeft: scale(8)
  },
  itemsTitle: { fontWeight: '700', fontSize: moderateScale(18), marginVertical: verticalScale(12), color: '#222' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: scale(12),
    marginBottom: verticalScale(10),
  },
  itemImage: { width: scale(48), height: scale(48), marginRight: scale(10), borderRadius: scale(8) },
  itemName: { fontWeight: '600', fontSize: moderateScale(15), color: '#222' },
  itemDesc: { color: '#888', fontSize: moderateScale(12), marginTop: verticalScale(2) },
  itemQty: { fontWeight: '600', fontSize: moderateScale(14), color: '#666', marginHorizontal: scale(10) },
  itemPrice: { fontWeight: '700', fontSize: moderateScale(15), color: '#23238E' },
  paymentBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(16)
  },
  paymentTitle: { fontWeight: '700', fontSize: moderateScale(15), marginBottom: verticalScale(12), color: '#222' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
  paymentLabel: { color: '#666', fontSize: moderateScale(14) },
  paymentValue: { color: '#222', fontSize: moderateScale(14) },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: verticalScale(8) },
  paymentLabelBold: { color: '#222', fontWeight: 'bold', fontSize: moderateScale(16) },
  paymentValueBold: { color: '#23238E', fontWeight: 'bold', fontSize: moderateScale(18) },
  placeOrderBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(30),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginBottom: hp(2)
  },
  btnDisabled: { opacity: 0.7 },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(16) },
});

export default PharmacyBillScreen;
