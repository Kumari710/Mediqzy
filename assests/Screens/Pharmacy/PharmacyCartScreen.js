import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
  getCartItems,
  updateQuantity,
  removeFromCart,
  getCartTotal
} from '../../Utils/firebasePharmacyStorage';

export default function PharmacyCartScreen() {
  const navigation = useNavigation();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ subtotal: 0, taxes: 0, total: 0 });

  // Product name to image mapping for products that use drug2.png
  const DRUG2_PRODUCTS = ['bodrex', 'oskadon'];

  // Helper to get correct image based on imageName or product name
  const getProductImage = (item) => {
    // First check if imageName exists and is drug2
    if (item.imageName === 'drug2.png') {
      return require('../../images/drug2.png');
    }
    // Check by product name if imageName is missing
    const nameLower = (item.name || '').toLowerCase();
    if (DRUG2_PRODUCTS.some(name => nameLower.includes(name))) {
      return require('../../images/drug2.png');
    }
    // Default to drug1
    return require('../../images/drug1.png');
  };

  // Load cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    setLoading(true);
    const items = await getCartItems();
    const cartTotals = await getCartTotal();
    setCart(items);
    setTotals(cartTotals);
    setLoading(false);
  };

  const handleUpdateQty = async (id, delta) => {
    const updatedCart = await updateQuantity(id, delta);
    setCart(updatedCart);
    const cartTotals = await getCartTotal();
    setTotals(cartTotals);
  };

  const handleRemoveItem = async (id) => {
    const updatedCart = await removeFromCart(id);
    setCart(updatedCart);
    const cartTotals = await getCartTotal();
    setTotals(cartTotals);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={getProductImage(item)}
        style={styles.cartImage}
        resizeMode="contain"
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartDesc}>{item.desc}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => handleUpdateQty(item.id, -1)}
            style={styles.minusBtn}
          >
            <Text style={styles.minusText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.qty}</Text>

          <TouchableOpacity
            onPress={() => handleUpdateQty(item.id, 1)}
            style={styles.plusBtn}
          >
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.cartPrice}>
        Rs.{(() => {
          const price = typeof item.price === 'string'
            ? parseFloat(item.price.replace(/[^\d.]/g, ''))
            : (parseFloat(item.price) || 0);
          return Math.round(price * item.qty);
        })()}
      </Text>

      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
        <Ionicons name="close-circle" size={moderateScale(24)} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#2B2B7E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: scale(40) }} />
        </View>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('PharmacyScreen')}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              renderItem={renderItem}
              keyExtractor={item => item.id?.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />

            {/* Payment Breakdown */}
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>Payment breakdown</Text>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>Rs.{totals.subtotal}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Taxes</Text>
                <Text style={styles.paymentValue}>Rs.{totals.taxes}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs.{totals.total}</Text>
              </View>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.bottomTotal}>Total</Text>
                <Text style={styles.bottomPrice}>Rs.{totals.total}</Text>
              </View>

              <TouchableOpacity
                style={styles.proceedBtn}
                onPress={() => {
                  const bookingDetails = {
                    type: 'pharmacy',
                    items: cart.map(item => ({
                      id: String(item.id),
                      name: String(item.name || 'Unknown Product'),
                      desc: String(item.desc || ''),
                      qty: parseInt(item.qty) || 1,
                      price: parseFloat(item.price) || 0,
                      imageName: item.imageName || 'drug1.png',
                    })),
                    provider: {
                      name: 'Apollo Pharmacy',
                      address: 'T.nagar, Chennai 600017',
                    },
                    summary: {
                      subtotal: totals.subtotal,
                      taxes: totals.taxes,
                      total: totals.total,
                      deliveryCharge: 0,
                    }
                  };
                  navigation.navigate('AddressListScreen', {
                    bookingDetails: bookingDetails
                  });
                }}
              >
                <Text style={styles.proceedText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#222',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  emptyCartText: {
    fontSize: moderateScale(18),
    color: '#888',
    marginBottom: verticalScale(20),
  },
  shopNowBtn: {
    backgroundColor: '#2B2B7E',
    paddingHorizontal: wp(8),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
  },
  shopNowText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    backgroundColor: '#fff',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cartImage: {
    width: scale(60),
    height: scale(60),
    marginRight: scale(14),
    borderRadius: moderateScale(10),
    backgroundColor: '#F5F7FA',
  },
  cartName: { fontWeight: '700', fontSize: moderateScale(16), color: '#222' },
  cartDesc: { color: '#888', fontSize: moderateScale(13), marginTop: verticalScale(2) },

  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(8) },
  minusBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusText: { fontSize: moderateScale(18) },

  plusBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(8),
    backgroundColor: '#2B2B7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { color: '#fff', fontSize: moderateScale(18), fontWeight: '700' },

  qtyText: { marginHorizontal: scale(12), fontSize: moderateScale(16), fontWeight: '600' },

  cartPrice: { fontWeight: '700', fontSize: moderateScale(15), marginRight: scale(10) },
  deleteIcon: { width: scale(20), height: scale(20), tintColor: '#aaa' },

  paymentBox: {
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6E6E6',
    padding: moderateScale(16),
    marginHorizontal: wp(5),
    marginBottom: hp(2),
  },
  paymentTitle: { fontWeight: '700', fontSize: moderateScale(14), marginBottom: verticalScale(10) },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(6) },
  paymentLabel: { color: '#888', fontSize: moderateScale(13) },
  paymentValue: { fontSize: moderateScale(13), color: '#222', fontWeight: '500' },
  totalLabel: { fontWeight: '700', fontSize: moderateScale(15), color: '#222', marginTop: verticalScale(4) },
  totalValue: { fontWeight: '700', fontSize: moderateScale(15), color: '#2B2B7E', marginTop: verticalScale(4) },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    paddingBottom: Platform.OS === 'ios' ? hp(3.5) : hp(1.5),
  },
  bottomTotal: { color: '#777', fontSize: moderateScale(12) },
  bottomPrice: { fontWeight: '700', fontSize: moderateScale(18), color: '#2B2B7E' },

  proceedBtn: {
    backgroundColor: '#2B2B7E',
    paddingHorizontal: wp(10),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(14),
  },
  proceedText: { color: '#fff', fontWeight: '700', fontSize: moderateScale(16) },
});
