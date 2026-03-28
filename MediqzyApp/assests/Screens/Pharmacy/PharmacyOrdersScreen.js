import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { queryData, onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function PharmacyOrdersScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  // Subscribe to real-time updates
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const unsubscribe = onDataChange(`pharmacyOrders/${user.uid}`, (data) => {
      if (data) {
        const ordersList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        // Sort by createdAt descending (newest first)
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersList);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loadOrders = async () => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await queryData(`pharmacyOrders/${user.uid}`, { orderBy: 'createdAt', limitToLast: true, limit: 50 });
      if (result.success && result.data) {
        const ordersList = result.data.reverse(); // newest first
        setOrders(ordersList);
      }
    } catch (error) {
      console.log('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  /**
   * Formats a date string into a user-friendly label
   * Uses calendar day comparison (not 24-hour periods) for accurate Today/Yesterday
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';

    const orderDate = new Date(dateString);

    // Check if date is valid
    if (isNaN(orderDate.getTime())) return 'Recent';

    const now = new Date();

    // Normalize both dates to midnight for calendar day comparison
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const orderMidnight = new Date(orderDate);
    orderMidnight.setHours(0, 0, 0, 0);

    // Calculate difference in calendar days
    const diffTime = todayMidnight.getTime() - orderMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    // For older orders, include year only if different from current year
    const isCurrentYear = orderDate.getFullYear() === now.getFullYear();

    if (isCurrentYear) {
      return orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } else {
      return orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };


  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'processing':
      case 'dispatched':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'delivered':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const renderOrderCard = (order) => {
    const statusStyle = getStatusStyle(order.status);

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => navigation.navigate('DeliveryStatusScreen', { orderId: order.id, order })}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <Image source={require('../../images/apollo.png')} style={styles.pharmacyLogo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pharmacyName}>{order.pharmacy?.name || 'Pharmacy'}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
            </Text>
          </View>
        </View>

        {/* Order ID */}
        <Text style={styles.orderId}>Order #{order.id?.slice(-8).toUpperCase()}</Text>

        {/* Items Preview */}
        <View style={styles.itemsRow}>
          {order.items?.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <Image source={require('../../images/pharmacy.png')} style={styles.itemImage} />
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            </View>
          ))}
          {order.items?.length > 3 && (
            <View style={styles.moreItems}>
              <Text style={styles.moreText}>+{order.items.length - 3}</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={styles.price}>₹{order.total}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {order.status === 'pending' || order.status === 'dispatched' ? (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => navigation.navigate('DeliveryStatusScreen', { orderId: order.id, order })}
            >
              <Ionicons name="location-outline" size={moderateScale(18)} color="#fff" />
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>
          ) : order.status === 'delivered' ? (
            <TouchableOpacity style={styles.reorderBtn}>
              <Ionicons name="refresh-outline" size={moderateScale(18)} color="#23238E" />
              <Text style={styles.reorderBtnText}>Reorder</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#23238E" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23238E']} />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={moderateScale(80)} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptyText}>Your pharmacy orders will appear here</Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('PharmacyScreen')}
              >
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map(renderOrderCard)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#666' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: scale(40), padding: scale(4) },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingVertical: hp(2), paddingBottom: hp(4) },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
  pharmacyLogo: { width: scale(44), height: scale(44), borderRadius: scale(10), marginRight: scale(12) },
  pharmacyName: { fontWeight: '700', fontSize: moderateScale(16), color: '#1F2937' },
  orderDate: { fontSize: moderateScale(12), color: '#6B7280', marginTop: verticalScale(2) },

  statusBadge: { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(20) },
  statusText: { fontWeight: '600', fontSize: moderateScale(12) },

  orderId: { fontSize: moderateScale(12), color: '#9CA3AF', marginBottom: verticalScale(12) },

  itemsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12) },
  itemCard: { alignItems: 'center', backgroundColor: '#F9FAFB', padding: scale(8), borderRadius: scale(10), marginRight: scale(8), width: scale(60) },
  itemImage: { width: scale(32), height: scale(32), marginBottom: verticalScale(4) },
  itemName: { fontSize: moderateScale(10), color: '#374151', fontWeight: '500' },
  moreItems: { width: scale(40), height: scale(40), borderRadius: scale(10), backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  moreText: { fontSize: moderateScale(12), color: '#6B7280', fontWeight: '600' },
  price: { fontWeight: '700', fontSize: moderateScale(18), color: '#23238E' },

  actionsRow: { flexDirection: 'row', marginTop: verticalScale(8) },
  trackBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23238E', paddingHorizontal: scale(20), paddingVertical: verticalScale(12), borderRadius: scale(25), flex: 1, justifyContent: 'center' },
  trackBtnText: { color: '#fff', fontWeight: '600', fontSize: moderateScale(14), marginLeft: scale(8) },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#23238E', paddingHorizontal: scale(20), paddingVertical: verticalScale(12), borderRadius: scale(25), flex: 1, justifyContent: 'center' },
  reorderBtnText: { color: '#23238E', fontWeight: '600', fontSize: moderateScale(14), marginLeft: scale(8) },

  emptyState: { alignItems: 'center', paddingTop: hp(15) },
  emptyTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#374151', marginTop: verticalScale(20) },
  emptyText: { fontSize: moderateScale(14), color: '#9CA3AF', marginTop: verticalScale(8) },
  shopBtn: { backgroundColor: '#23238E', paddingHorizontal: scale(30), paddingVertical: verticalScale(14), borderRadius: scale(25), marginTop: verticalScale(24) },
  shopBtnText: { color: '#fff', fontWeight: '600', fontSize: moderateScale(15) },
});
